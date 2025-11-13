import { none } from '@hookstate/core'
import {
  createEntity,
  defineQuery,
  defineSystem,
  ECSState,
  Engine,
  EngineState,
  entityExists,
  EntityID,
  EntityTreeComponent,
  EntityUUID,
  getComponent,
  hasComponent,
  removeEntity,
  setComponent,
  SimulationSystemGroup,
  SourceID,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  NetworkTopics,
  useMutableState,
  UserID
} from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { Physics, RaycastArgs } from '@ir-engine/spatial/src/physics/classes/Physics'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { getInteractionGroups } from '@ir-engine/spatial/src/physics/functions/getInteractionGroups'
import { BodyTypes, SceneQueryType } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import React, { useEffect } from 'react'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { preloadedAnimations } from '../../avatar/animation/Util'
import { AvatarAnimationComponent, AvatarRigComponent } from '../../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarMovementSettingsState } from '../../avatar/state/AvatarMovementSettingsState'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { SceneState } from '../../gltf/GLTFState'
import { AgentComponent, AgentVolumeComponent } from '../components/AgentComponents'
import { EnvMapComponent } from '../components/EnvmapComponent'
import { AgentActions } from '../functions/AgentActions'

const SPAWN_BOX_X_MIN = -6
const SPAWN_BOX_X_MAX = 6
const SPAWN_BOX_Z_MIN = -5
const SPAWN_BOX_Z_MAX = 5

const AVOIDANCE_DISTANCE = 0.25

const _agentPosition = new Vector3()
const _quaternion = new Quaternion()
const _up = new Vector3(0, 1, 0)
const _matrix = new Matrix4()
const _flip = new Quaternion(0, 1, 0, 0)

// Raycast configuration for obstacle detection
const raycastQuery = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(),
  maxDistance: AVOIDANCE_DISTANCE,
  groups: getInteractionGroups(CollisionGroups.Default, CollisionGroups.Default)
} as RaycastArgs

const agentQuery = defineQuery([AgentComponent, RigidBodyComponent, TransformComponent, UUIDComponent])

const execute = () => {
  for (const agent of agentQuery()) {
    const agentComponent = getComponent(agent, AgentComponent)
    if (getState(AgentState)[UUIDComponent.get(agent)].owner !== getState(EngineState).userID) continue
    const rigidbody = getComponent(agent, RigidBodyComponent)
    TransformComponent.getWorldPosition(agent, _agentPosition)

    if (agentComponent.interest > 3) {
      agentComponent.interest = 0
      // Set interest point inside rectangular box area
      const x = Math.random() * (SPAWN_BOX_X_MAX - SPAWN_BOX_X_MIN) + SPAWN_BOX_X_MIN
      const z = Math.random() * (SPAWN_BOX_Z_MAX - SPAWN_BOX_Z_MIN) + SPAWN_BOX_Z_MIN
      agentComponent.interestPoint.set(x, 0, z)
    }

    // Calculate base direction to target position
    const _direction = agentComponent.direction
    // Check for obstacles in the direction of movement
    const physicsWorld = Physics.getWorld(agent)!
    raycastQuery.direction.copy(_direction)
    raycastQuery.origin.copy(_agentPosition).setY(_agentPosition.y + 0.5)
    raycastQuery.excludeCollider = UUIDComponent.getEntityByUUID((UUIDComponent.get(agent) + 'collider') as EntityUUID)
    const raycast = Physics.castRay(physicsWorld, raycastQuery)
    if (raycast) {
      if (raycast[0]?.entity)
        //get direction from raycast hit to the center of the hit transform
        agentComponent.interest += 10
    }

    if (agentComponent.interestPoint.distanceTo(_agentPosition) < 0.25) {
      if (agentComponent.interest <= 0) {
        const rng = Math.ceil(Math.random() * 5)
        let animString = ''
        switch (rng) {
          case 1:
            animString = 'Idle'
            break
          case 2:
            animString = 'Dance1'
            break
          case 3:
            animString = 'Dance2'
            break
          case 4:
            animString = 'Dance3'
            break
          case 5:
            animString = 'Dance4'
            break
        }
        dispatchAction(
          AvatarNetworkAction.setAnimationState({
            animationAsset: preloadedAnimations.emotes,
            clipName: animString,
            loop: false,
            layer: 0,
            entityUUID: UUIDComponent.get(agent)
          })
        )
      }
      agentComponent.interest += getState(ECSState).deltaSeconds
      _direction.lerp(new Vector3(), 0.1)
    } else {
      _direction.subVectors(agentComponent.interestPoint, _agentPosition)

      _direction.normalize()

      _direction.multiplyScalar(getState(AvatarMovementSettingsState).walkSpeed)
      _direction.y = 0 // Keep grounded
    }

    rigidbody.linearVelocity.copy(_direction)
    rigidbody.targetKinematicPosition.copy(_agentPosition.add(_direction.clone().multiplyScalar(0.05)))

    // Set rotation to face movement direction
    _quaternion.setFromRotationMatrix(_matrix.lookAt(new Vector3(), _direction, _up)).multiply(_flip)
    rigidbody.targetKinematicRotation.slerp(_quaternion, 0.025)
  }
}

const spawnAgent = (url: string, entityID: EntityID, entitySourceID: SourceID) => {
  const sceneState = getState(SceneState)
  const lastSceneURL = Object.keys(sceneState)[Object.keys(sceneState).length - 1]
  const originEntity = sceneState[lastSceneURL]
  if (!originEntity) return

  const x = Math.random() * (SPAWN_BOX_X_MAX - SPAWN_BOX_X_MIN) + SPAWN_BOX_X_MIN
  const z = Math.random() * (SPAWN_BOX_Z_MAX - SPAWN_BOX_Z_MIN) + SPAWN_BOX_Z_MIN
  const position = new Vector3(x, 0, z)

  dispatchAction(
    AgentActions.spawnAgent({
      position,
      url,
      parentUUID: UUIDComponent.get(originEntity),
      entitySourceID,
      entityID,
      ownerID: getState(EngineState).userID,
      $topic: NetworkTopics.world,
      $peer: Engine.instance.store.peerID
    })
  )
}

const AgentState = defineState({
  name: 'AgentState',
  initial: {} as Record<
    EntityUUID,
    {
      owner: UserID
      url: string
      position: Vector3
    }
  >,

  receptors: {
    onSpawnAgent: AgentActions.spawnAgent.receive((action) => {
      getMutableState(AgentState)[
        UUIDComponent.join({ entityID: action.entityID, entitySourceID: action.entitySourceID })
      ].set({
        owner: action.ownerID,
        url: action.url,
        position: action.position
      })
    }),

    onDestroyAgent: AgentActions.destroyAgent.receive((action) => {
      getMutableState(AgentState)[action.entityUUID].set(none)
    }),

    onDamageAgent: AgentActions.damageAgent.receive((action) => {
      const state = getMutableState(AgentState)
      if (!state[action.entityUUID].value) return
    })
  },

  reactor: () => {
    const state = useMutableState(AgentState)

    return (
      <>
        {state.keys.map((entityUUID: EntityUUID) => (
          <AgentNetworkReactor
            key={entityUUID}
            entityUUID={entityUUID}
            owner={state[entityUUID].owner.value}
            position={state[entityUUID].position.value}
          />
        ))}
      </>
    )
  }
})

const AgentNetworkReactor = (props: { entityUUID: EntityUUID; owner: UserID; position: Vector3 }) => {
  const { entityUUID, owner, position } = props
  const agentState = useMutableState(AgentState)

  useEffect(() => {
    const entity = UUIDComponent.getEntityByUUID(entityUUID)
    if (hasComponent(entity, AgentComponent)) return
    setComponent(entity, TransformComponent, { position })
    setComponent(entity, GLTFComponent, { src: agentState[entityUUID].url.value })
    setComponent(entity, VisibleComponent)
    setComponent(entity, EnvMapComponent, { type: 'Skybox' })

    setComponent(entity, AgentComponent, {})

    // problems
    // setComponent(entity, EnvMapComponent, {type: 'Bake', envMapSourceEntityUUID: getComponent(bakeQuery()[0], UUIDComponent)!.entityID, envMapIntensity: 3})

    setComponent(entity, AvatarComponent)
    setComponent(entity, AvatarAnimationComponent)
    setComponent(entity, AvatarRigComponent)
    setComponent(entity, RigidBodyComponent, {
      type: BodyTypes.Kinematic,
      allowRolling: false,
      enabledRotations: [false, true, false]
    })

    //create child entity collider
    const colliderEntity = createEntity()
    setComponent(colliderEntity, EntityTreeComponent, { parentEntity: entity })
    setComponent(colliderEntity, TransformComponent, {
      scale: new Vector3(0.25, 1, 0.25),
      position: new Vector3(0, 0.5, 0)
    })
    setComponent(colliderEntity, UUIDComponent, {
      entityID: 'collider' as EntityID,
      entitySourceID: UUIDComponent.getAsSourceID(entity)
    })
    setComponent(colliderEntity, ColliderComponent, {
      shape: 'capsule',
      collisionLayer: CollisionGroups.Default,
      collisionMask: CollisionGroups.Default,
      restitution: 0.8
    })
    return () => {
      // why is this entity exists check necessary? there's some issue with physics entity cleanup
      if (!entityExists(getComponent(colliderEntity, EntityTreeComponent)?.parentEntity)) removeEntity(colliderEntity)
    }
  }, [entityUUID])

  return null
}

export const AgentSystem = defineSystem({
  uuid: 'agentSpawnSystem',
  insert: { after: SimulationSystemGroup },
  execute,
  reactor: () => {
    const agentVolumeQuery = useQuery([AgentVolumeComponent])
    useEffect(() => {
      if (!agentVolumeQuery.length) return
      for (let i = 0; i < agentVolumeQuery.length; i++) {
        const agentVolumeComponent = getComponent(agentVolumeQuery[i], AgentVolumeComponent)
        for (let j = agentVolumeComponent.avatarEntities.length; j < agentVolumeComponent.avatarCount; j++) {
          const entityID = UUIDComponent.generate() as EntityID
          const entitySourceID = UUIDComponent.getAsSourceID(agentVolumeQuery[i]) as SourceID
          const joinedUUID = UUIDComponent.join({ entityID, entitySourceID })
          const getRandomAvatarIndex = () => Math.floor(Math.random() * agentVolumeComponent.avatarList.length)
          const randomIndex = getRandomAvatarIndex()
          spawnAgent(agentVolumeComponent.avatarList[randomIndex], entityID, entitySourceID)
          agentVolumeComponent.avatarEntities.push(joinedUUID)
        }
      }
    }, [agentVolumeQuery])

    return null
  }
})
