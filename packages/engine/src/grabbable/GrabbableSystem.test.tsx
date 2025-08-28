import assert from 'assert'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'

import {
  Entity,
  EntityNetworkState,
  EntityUUIDPair,
  NetworkObjectComponent,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import { getComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import {
  HyperFlux,
  Network,
  NetworkActions,
  NetworkState,
  NetworkTopics,
  PeerID,
  ScenePeer,
  SceneUser,
  UserID,
  applyIncomingActions,
  dispatchAction,
  getMutableState,
  getState
} from '@ir-engine/hyperflux'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'

import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'
import { initializeSpatialEngine, initializeSpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { SpawnObjectActions } from '@ir-engine/spatial/src/transform/SpawnObjectActions'
import { loadEmptyScene } from '../../tests/util/loadEmptyScene'
import { AvatarNetworkAction } from '../avatar/state/AvatarNetworkActions'

import { EngineState } from '@ir-engine/ecs'
import '@ir-engine/spatial/src/transform/SpawnPoseState'
import { act, render } from '@testing-library/react'
import '../avatar/state/AvatarNetworkState'
import { GrabbableComponent, GrabbableNetworkAction, GrabbedComponent, GrabberComponent } from './GrabbableComponent'
import { GrabbableState } from './GrabbableState'

describe('GrabbableSystem', () => {
  let sceneEntity: Entity

  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    initializeSpatialViewer()
    await Physics.load()

    sceneEntity = loadEmptyScene()
    setComponent(sceneEntity, SceneComponent)
    const physicsWorld = Physics.createWorld(sceneEntity)
    physicsWorld.timestep = 1 / 60
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('can grab an object owner by the host as another user', async () => {
    const hostPeerID = 'host peer' as PeerID
    const hostUserID = 'host user' as UserID

    const userID = 'user id' as UserID
    const peerID = HyperFlux.store.peerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    getMutableState(EngineState).userID.set(userID)
    const network = NetworkState.worldNetwork as Network

    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID,
        peerIndex: 0,
        userID: userID,
        $network: network.id
      })
    )

    const avatarEntityUUIDPair = { entitySourceID: 'user-id', entityID: 'avatar' } as EntityUUIDPair
    const avatarEntityUUID = UUIDComponent.join(avatarEntityUUIDPair)

    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID: UUIDComponent.get(sceneEntity),
        entityID: avatarEntityUUIDPair.entityID,
        entitySourceID: avatarEntityUUIDPair.entitySourceID,
        avatarURL: '',
        name: ''
      })
    )

    const grabbableEntityUUIDPair = { entitySourceID: 'grabbable-id', entityID: 'grabbable' } as EntityUUIDPair
    const grabbableEntityUUID = UUIDComponent.join(grabbableEntityUUIDPair)

    dispatchAction(
      SpawnObjectActions.spawnObject({
        parentUUID: UUIDComponent.get(sceneEntity),
        entityID: grabbableEntityUUIDPair.entityID,
        entitySourceID: grabbableEntityUUIDPair.entitySourceID,
        ownerID: network.hostUserID!,
        $topic: NetworkTopics.world,
        $peer: hostPeerID,
        $user: hostUserID
      })
    )

    applyIncomingActions()

    const grabbableEntity = UUIDComponent.getEntityByUUID(UUIDComponent.join(grabbableEntityUUIDPair))
    setComponent(grabbableEntity, GrabbableComponent)

    const playerEntity = UUIDComponent.getEntityByUUID(UUIDComponent.join(avatarEntityUUIDPair))
    assert.ok(hasComponent(playerEntity, GrabberComponent))

    assert.equal(Object.keys(getState(GrabbableState)).length, 0)

    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: grabbableEntityUUID,
        grabbed: true,
        attachmentPoint: 'right',
        grabberEntityUUID: avatarEntityUUID
      })
    )

    applyIncomingActions()

    // assert that the grabbable state has been updated
    assert.equal(Object.keys(getState(GrabbableState)).length, 1)
    assert.equal(getState(GrabbableState)[grabbableEntityUUID].grabberEntityUUID, avatarEntityUUID)
    assert.equal(getState(GrabbableState)[grabbableEntityUUID].attachmentPoint, 'right')

    // should not have authority
    assert.equal(getComponent(grabbableEntity, NetworkObjectComponent).authorityPeerID, hostPeerID)
    assert.equal(hasComponent(grabbableEntity, GrabbedComponent), false)

    applyIncomingActions()

    // ensure we have requested authority
    assert.equal(getState(EntityNetworkState)[grabbableEntityUUID].requestingPeerId, peerID)

    // since we arent the host, we need to manually transfer authority acting as the host
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        ownerID: hostUserID,
        entityUUID: grabbableEntityUUID,
        newAuthority: peerID,
        $user: hostUserID,
        $peer: hostPeerID
      })
    )

    applyIncomingActions()

    // wait for the authority transfer to be processed by the GrabbableState reactor
    await act(() => render(null))

    // should now have authority
    await vi.waitFor(() => {
      assert.equal(getComponent(grabbableEntity, NetworkObjectComponent).authorityPeerID, peerID)
      assert.ok(hasComponent(grabbableEntity, GrabbedComponent))
    })

    /** @todo test transforms */

    // const grabbableTransform = getComponent(item, TransformComponent)
    // const attachmentPoint = grabbedComponent.attachmentPoint
    // const { position, rotation } = getHandTarget(item, attachmentPoint)!

    // strictEqual(grabbableTransform.position.x, position.x)
    // strictEqual(grabbableTransform.position.y, position.y)
    // strictEqual(grabbableTransform.position.z, position.z)

    // strictEqual(grabbableTransform.rotation.x, rotation.x)
    // strictEqual(grabbableTransform.rotation.y, rotation.y)
    // strictEqual(grabbableTransform.rotation.z, rotation.z)
    // strictEqual(grabbableTransform.rotation.w, rotation.w)
  })

  it('can grab an object owner by the scene as another user', async () => {
    const hostPeerID = 'host peer' as PeerID
    const hostUserID = 'host user' as UserID

    const userID = 'user id' as UserID
    const peerID = HyperFlux.store.peerID

    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

    getMutableState(EngineState).userID.set(userID)
    const network = NetworkState.worldNetwork as Network

    dispatchAction(
      NetworkActions.peerJoined({
        peerID: peerID,
        peerIndex: 0,
        userID: userID,
        $network: network.id
      })
    )

    const avatarEntityUUIDPair = { entitySourceID: 'user-id', entityID: 'avatar' } as EntityUUIDPair
    const avatarEntityUUID = UUIDComponent.join(avatarEntityUUIDPair)

    dispatchAction(
      AvatarNetworkAction.spawn({
        parentUUID: UUIDComponent.get(sceneEntity),
        entityID: avatarEntityUUIDPair.entityID,
        entitySourceID: avatarEntityUUIDPair.entitySourceID,
        avatarURL: '',
        name: ''
      })
    )

    const grabbableEntityUUIDPair = { entitySourceID: 'grabbable-id', entityID: 'grabbable' } as EntityUUIDPair
    const grabbableEntityUUID = UUIDComponent.join(grabbableEntityUUIDPair)

    dispatchAction(
      SpawnObjectActions.spawnObject({
        parentUUID: UUIDComponent.get(sceneEntity),
        entityID: grabbableEntityUUIDPair.entityID,
        entitySourceID: grabbableEntityUUIDPair.entitySourceID,
        ownerID: SceneUser,
        $peer: ScenePeer,
        $user: SceneUser,
        $topic: NetworkTopics.world
      })
    )

    applyIncomingActions()

    const grabbableEntity = UUIDComponent.getEntityByUUID(grabbableEntityUUID)
    setComponent(grabbableEntity, GrabbableComponent)

    const playerEntity = UUIDComponent.getEntityByUUID(avatarEntityUUID)
    assert.ok(hasComponent(playerEntity, GrabberComponent))

    assert.equal(Object.keys(getState(GrabbableState)).length, 0)

    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: grabbableEntityUUID,
        grabbed: true,
        attachmentPoint: 'right',
        grabberEntityUUID: avatarEntityUUID
      })
    )

    applyIncomingActions()

    // assert that the grabbable state has been updated
    assert.equal(Object.keys(getState(GrabbableState)).length, 1)
    assert.equal(getState(GrabbableState)[grabbableEntityUUID].grabberEntityUUID, avatarEntityUUID)
    assert.equal(getState(GrabbableState)[grabbableEntityUUID].attachmentPoint, 'right')

    // should not have authority
    assert.equal(getComponent(grabbableEntity, NetworkObjectComponent).authorityPeerID, ScenePeer)
    assert.equal(hasComponent(grabbableEntity, GrabbedComponent), false)

    applyIncomingActions()

    // ensure we have requested authority
    assert.equal(getState(EntityNetworkState)[grabbableEntityUUID].requestingPeerId, peerID)

    // since we arent the host, we need to manually transfer authority acting as the host
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        ownerID: SceneUser,
        entityUUID: grabbableEntityUUID,
        newAuthority: peerID,
        $peer: peerID,
        $user: userID
      })
    )

    applyIncomingActions()

    await vi.waitFor(() => {
      // should now have authority
      assert.equal(getComponent(grabbableEntity, NetworkObjectComponent).authorityPeerID, peerID)
      assert.ok(hasComponent(grabbableEntity, GrabbedComponent))
    })
  })
})
