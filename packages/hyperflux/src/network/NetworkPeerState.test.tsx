import { afterEach, assert, beforeEach, describe, it } from 'vitest'

import {
  applyIncomingActions,
  createHyperStore,
  dispatchAction,
  getMutableState,
  getState,
  HyperFlux,
  NetworkID,
  PeerID,
  stopAllReactors,
  UserID
} from '@ir-engine/hyperflux'

import { joinNetwork, NetworkTopics } from './NetworkState'

import './NetworkPeerState'

import { NetworkActions, NetworkPeerState } from './NetworkPeerState'
import { NetworkState } from './NetworkState'

describe('NetworkPeerState', () => {
  let agentID: UserID

  beforeEach(async () => {
    createHyperStore({ getAgentID: () => agentID })
  })

  afterEach(() => {
    stopAllReactors()
  })

  describe('peer can join', () => {
    it('should add peer to state', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = HyperFlux.store.peerID
      agentID = hostUserID
      const instanceID = 'instanceID' as NetworkID

      getMutableState(NetworkState).hostIds.world.set(instanceID)
      const network = joinNetwork(instanceID, hostPeerID, NetworkTopics.world)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: hostPeerID,
          peerIndex: 0,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      const state = getState(NetworkPeerState)[instanceID]

      assert.ok(state)
      assert.equal(state.peers[hostPeerID].peerID, hostPeerID)
      assert.equal(state.peerIndexToPeerID[0], hostPeerID)
      assert.equal(state.peerIDToPeerIndex[hostPeerID], 0)
      assert.equal(state.users[hostUserID].length, 1)
      assert.equal(state.users[hostUserID][0], hostPeerID)
    })

    it('should add multiple peers to state', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = HyperFlux.store.peerID
      agentID = hostUserID
      const instanceID = 'instanceID' as NetworkID

      getMutableState(NetworkState).hostIds.world.set(instanceID)
      const network = joinNetwork(instanceID, hostPeerID, NetworkTopics.world)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: hostPeerID,
          peerIndex: 0,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      const state = getState(NetworkPeerState)[instanceID]

      const peerUserID = 'user 2' as UserID
      const peerPeerID = 'user 2 peer' as PeerID

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerPeerID,
          peerIndex: 1,
          userID: peerUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      assert.ok(state)
      assert.equal(state.peers[hostPeerID].peerID, hostPeerID)
      assert.equal(state.peerIndexToPeerID[0], hostPeerID)
      assert.equal(state.peerIDToPeerIndex[hostPeerID], 0)
      assert.equal(state.users[hostUserID].length, 1)
      assert.equal(state.users[hostUserID][0], hostPeerID)

      assert.equal(state.peers[peerPeerID].peerID, peerPeerID)
      assert.equal(state.peerIndexToPeerID[1], peerPeerID)
      assert.equal(state.peerIDToPeerIndex[peerPeerID], 1)
      assert.equal(state.users[peerUserID].length, 1)
      assert.equal(state.users[peerUserID][0], peerPeerID)
    })

    it('should add multiple peers to state with same user', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = HyperFlux.store.peerID
      agentID = hostUserID
      const instanceID = 'instanceID' as NetworkID

      getMutableState(NetworkState).hostIds.world.set(instanceID)
      const network = joinNetwork(instanceID, hostPeerID, NetworkTopics.world)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: hostPeerID,
          peerIndex: 0,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      const state = getState(NetworkPeerState)[instanceID]

      const peerPeerID = 'peer 2' as PeerID

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerPeerID,
          peerIndex: 1,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      assert.ok(state)
      assert.equal(state.peers[hostPeerID].peerID, hostPeerID)
      assert.equal(state.peerIndexToPeerID[0], hostPeerID)
      assert.equal(state.peerIDToPeerIndex[hostPeerID], 0)
      assert.equal(state.users[hostUserID].length, 2)
      assert.equal(state.users[hostUserID][0], hostPeerID)
      assert.equal(state.users[hostUserID][1], peerPeerID)

      assert.equal(state.peers[peerPeerID].peerID, peerPeerID)
      assert.equal(state.peerIndexToPeerID[1], peerPeerID)
      assert.equal(state.peerIDToPeerIndex[peerPeerID], 1)
    })

    it('should remove peer', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = HyperFlux.store.peerID
      agentID = hostUserID
      const instanceID = 'instanceID' as NetworkID

      getMutableState(NetworkState).hostIds.world.set(instanceID)
      const network = joinNetwork(instanceID, hostPeerID, NetworkTopics.world)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: hostPeerID,
          peerIndex: 0,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      const state = getState(NetworkPeerState)[instanceID]

      dispatchAction(
        NetworkActions.peerLeft({
          peerID: hostPeerID,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      assert.ok(state)
      assert.equal(state.peers[hostPeerID], undefined)
      assert.equal(state.peerIndexToPeerID[0], undefined)
      assert.equal(state.peerIDToPeerIndex[hostPeerID], undefined)
      assert.equal(state.users[hostUserID], undefined)
    })

    it('should not remove user when a peer leaves but another remains', async () => {
      const hostUserID = 'host user' as UserID
      const hostPeerID = HyperFlux.store.peerID
      agentID = hostUserID
      const instanceID = 'instanceID' as NetworkID

      getMutableState(NetworkState).hostIds.world.set(instanceID)
      const network = joinNetwork(instanceID, hostPeerID, NetworkTopics.world)

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: hostPeerID,
          peerIndex: 0,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      const state = getState(NetworkPeerState)[instanceID]

      const peerUserID = 'peer user' as UserID
      const peerPeerID = 'peer peer' as PeerID

      dispatchAction(
        NetworkActions.peerJoined({
          peerID: peerPeerID,
          peerIndex: 1,
          userID: peerUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      dispatchAction(
        NetworkActions.peerLeft({
          peerID: hostPeerID,
          userID: hostUserID,
          $network: network.id
        })
      )
      applyIncomingActions()

      assert.ok(state)
      assert.equal(state.peers[hostPeerID], undefined)
      assert.equal(state.peerIndexToPeerID[0], undefined)
      assert.equal(state.peerIDToPeerIndex[hostPeerID], undefined)
      assert.equal(state.users[hostUserID], undefined)
      assert.equal(state.users[peerUserID].length, 1)
      assert.equal(state.users[peerUserID][0], peerPeerID)
    })
  })
})
