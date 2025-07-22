import { strictEqual } from 'assert'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'

import '@ir-engine/spatial/src/transform/SpawnPoseState'
import '../state/AvatarNetworkState'

import { Entity, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Engine, createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import {
  NetworkTopics,
  UserID,
  applyIncomingActions,
  dispatchAction,
  getMutableState,
  getState
} from '@ir-engine/hyperflux'
import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'
import { initializeSpatialEngine, initializeSpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { Physics, PhysicsWorld } from '@ir-engine/spatial/src/physics/classes/Physics'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'

import { EngineState } from '@ir-engine/ecs'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { applyGamepadInput } from './moveAvatar'

describe('moveAvatar function tests', () => {
  let sceneEntity: Entity
  let physicsWorld: PhysicsWorld
  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    initializeSpatialViewer()
    await Physics.load()
    getMutableState(EngineState).userID.set('userId' as UserID)
    sceneEntity = loadEmptyScene()

    setComponent(sceneEntity, SceneComponent)
    physicsWorld = Physics.createWorld(sceneEntity)
    physicsWorld.timestep = 1 / 60

    createMockNetwork(NetworkTopics.world, Engine.instance.store.peerID, getState(EngineState).userID)

    dispatchAction(
      AvatarNetworkAction.spawn({
        $peer: Engine.instance.store.peerID,
        parentUUID: UUIDComponent.get(sceneEntity),
        position: new Vector3(),
        rotation: new Quaternion(),
        entityID: AvatarComponent.entityID,
        entitySourceID: AvatarComponent.getSelfSourceID(),
        avatarURL: avatarUrl,
        name: 'TestAvatar'
      })
    )
    applyIncomingActions()
  })

  afterEach(() => {
    return destroyEngine()
  })

  const avatarUrl = 'packages/projects/default-project/assets/avatars/irRobot.vrm'

  it('should apply world.fixedDelta @ 60 tick to avatar movement, consistent with physics simulation', async () => {
    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    const entity = AvatarComponent.getSelfAvatarEntity()

    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity
    const avatar = getComponent(entity, AvatarControllerComponent)

    avatar.gamepadWorldMovement.setZ(-1)

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)
  })

  it('should apply world.fixedDelta @ 120 tick to avatar movement, consistent with physics simulation', async () => {
    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    const entity = AvatarComponent.getSelfAvatarEntity()
    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)
  })

  it('should take world.physics.timeScale into account when moving avatars, consistent with physics simulation', async () => {
    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    /* mock */
    physicsWorld.timestep = 1 / 2

    const entity = AvatarComponent.getSelfAvatarEntity()
    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)
  })

  it('should not allow velocity to breach a full unit through multiple frames', async () => {
    const ecsState = getMutableState(ECSState)
    ecsState.simulationTimestep.set(1000 / 60)

    const entity = AvatarComponent.getSelfAvatarEntity()
    const velocity = getComponent(entity, RigidBodyComponent).linearVelocity

    // velocity starts at 0
    strictEqual(velocity.x, 0)
    strictEqual(velocity.z, 0)

    /* run */
    applyGamepadInput(entity)

    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
    physicsWorld.step()
    applyGamepadInput(entity)
  })
})
