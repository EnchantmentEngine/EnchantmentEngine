import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { EntityID, UndefinedEntity, createEntity, destroyEngine, removeEntity } from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import {
  HyperFlux,
  NetworkActions,
  NetworkState,
  NetworkTopics,
  UserID,
  applyIncomingActions,
  dispatchAction,
  getState
} from '@ir-engine/hyperflux'
import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'
import { SpectateActions, SpectateEntityState } from './SpectateSystem'

describe('SpectateSystem', async () => {
  let viewerEntity = UndefinedEntity

  describe('SpectateEntityState', async () => {
    beforeEach(async () => {
      createEngine()
      HyperFlux.store.defaultDispatchDelay = () => 0
      viewerEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(viewerEntity)
      return destroyEngine()
    })

    it('should start spectating an entity when the `spectateEntity` action is dispatched', async () => {
      createMockNetwork(NetworkTopics.world)

      const userID = 'user id' as UserID
      const peerID = HyperFlux.store.peerID

      const network = NetworkState.worldNetwork

      dispatchAction(
        NetworkActions.peerJoined({
          $network: network.id,
          peerID: peerID,
          peerIndex: 1,
          userID: userID
        })
      )

      dispatchAction(
        SpectateActions.spectateEntity({
          spectatorUserID: userID,
          spectatingEntity: 'entity' as EntityID,
          $topic: NetworkTopics.world,
          $peer: HyperFlux.store.peerID
        })
      )
      applyIncomingActions()

      const state = getState(SpectateEntityState)[userID]
      assert.equal(state.spectating, 'entity', 'The spectator is not spectating the correct userID')
    })

    it('should stop spectating an entity when the `exitSpectate` action is dispatched', async () => {
      createMockNetwork(NetworkTopics.world)

      const userID = 'user id' as UserID
      const peerID = HyperFlux.store.peerID

      const network = NetworkState.worldNetwork

      dispatchAction(
        NetworkActions.peerJoined({
          $network: network.id,
          peerID: peerID,
          peerIndex: 1,
          userID: userID
        })
      )

      dispatchAction(
        SpectateActions.spectateEntity({
          spectatorUserID: userID,
          spectatingEntity: 'entity' as EntityID,
          $topic: NetworkTopics.world,
          $peer: HyperFlux.store.peerID
        })
      )

      applyIncomingActions()
      const before = getState(SpectateEntityState)[userID]
      assert.notEqual(before, undefined, "The spectator's SpectateEntityState should not be undefined after `getState`")
      assert.equal(before.spectating, 'entity', 'The spectator is not spectating the correct userID')

      dispatchAction(
        SpectateActions.exitSpectate({
          spectatorUserID: userID,
          $topic: NetworkTopics.world,
          $peer: HyperFlux.store.peerID
        })
      )
      applyIncomingActions()
      const after = getState(SpectateEntityState)[userID]
      assert.equal(after, undefined, "The spectator's SpectateEntityState should be undefined after exitSpectate")
    })
  })
})
