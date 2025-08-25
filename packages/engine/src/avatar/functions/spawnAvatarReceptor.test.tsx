import assert from 'assert'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'

import '@ir-engine/spatial/src/transform/SpawnPoseState'
import '../state/AvatarNetworkState'

import { Entity, UUIDComponent } from '@ir-engine/ecs'
import { hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
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
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import {
  RigidBodyComponent,
  RigidBodyKinematicTagComponent
} from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { EngineState } from '@ir-engine/ecs'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'

const avatarUrl = 'packages/projects/default-project/assets/avatars/irRobot.vrm'

describe('spawnAvatarReceptor', () => {
  let sceneEntity: Entity
  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    initializeSpatialViewer()
    await Physics.load()
    getMutableState(EngineState).userID.set('user' as UserID)
    sceneEntity = loadEmptyScene()

    setComponent(sceneEntity, SceneComponent)
    const physicsWorld = Physics.createWorld(sceneEntity)
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

  it('check the create avatar function', async () => {
    const entity = AvatarComponent.getSelfAvatarEntity()

    assert(hasComponent(entity, TransformComponent))
    assert(hasComponent(entity, AvatarAnimationComponent))
    assert(hasComponent(entity, AvatarControllerComponent))
    assert(hasComponent(entity, RigidBodyComponent))
    assert(hasComponent(entity, RigidBodyKinematicTagComponent))
  })
})
