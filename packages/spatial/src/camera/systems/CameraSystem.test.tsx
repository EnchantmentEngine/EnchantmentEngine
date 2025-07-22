import assert from 'assert'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'

import {
  Engine,
  EngineState,
  EntityID,
  EntityUUIDPair,
  SourceID,
  UUIDComponent,
  destroyEngine,
  hasComponent
} from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import {
  Network,
  NetworkState,
  NetworkTopics,
  UserID,
  applyIncomingActions,
  dispatchAction,
  getMutableState,
  getState
} from '@ir-engine/hyperflux'
import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { initializeSpatialViewer } from '../../initializeEngine'
import { CameraActions } from '../CameraState'
import { CameraComponent } from '../components/CameraComponent'
import './CameraSystem'

describe('CameraSystem', () => {
  describe('CameraEntityState', () => {
    beforeEach(() => {
      createEngine()
      Engine.instance.store.defaultDispatchDelay = () => 0
      initializeSpatialViewer()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should create a camera entity and apply a CameraComponent to that entity', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = Engine.instance.store.peerID

      createMockNetwork(NetworkTopics.world, hostPeerID, hostUserID)

      getMutableState(EngineState).userID.set(hostUserID)
      const cameraUUID = {
        entityID: 'camera' as EntityID,
        entitySourceID: hostUserID as string as SourceID
      } as EntityUUIDPair

      const network: Network = NetworkState.worldNetwork

      dispatchAction(
        CameraActions.spawnCamera({
          parentUUID: UUIDComponent.get(getState(ReferenceSpaceState).viewerEntity),
          entityID: cameraUUID.entityID,
          entitySourceID: cameraUUID.entitySourceID,
          ownerID: network.hostUserID!,
          $topic: NetworkTopics.world,
          $peer: Engine.instance.store.peerID
        })
      )
      applyIncomingActions()
      await vi.waitFor(() => {
        const cameraEntity = UUIDComponent.getEntityByUUID(UUIDComponent.join(cameraUUID))
        assert.ok(cameraEntity, "The spawnCamera Action didn't create an entity.")
        assert.ok(
          hasComponent(cameraEntity, CameraComponent),
          "The spawnCamera Action didn't apply the CameraComponent to the entity"
        )
      })
    })
  })
})
