import { strictEqual } from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { Entity, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { HyperFlux, NetworkTopics, UserID, applyIncomingActions, getMutableState, getState } from '@ir-engine/hyperflux'
import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'
import { initializeSpatialEngine, initializeSpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { Physics, PhysicsWorld } from '@ir-engine/spatial/src/physics/classes/Physics'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'

import { EngineState } from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { AvatarComponent, AvatarPrefab } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
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

    createMockNetwork(NetworkTopics.world, HyperFlux.store.peerID, getState(EngineState).userID)

    AvatarPrefab.spawn({
      entityID: AvatarComponent.entityID,
      entitySourceID: AvatarComponent.getSelfSourceID(),
      parentUUID: UUIDComponent.get(sceneEntity),
      components: {
        [AvatarComponent.jsonID]: {
          avatarURL: avatarUrl
        },
        [NameComponent.jsonID]: 'TestAvatar'
      }
    })
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
