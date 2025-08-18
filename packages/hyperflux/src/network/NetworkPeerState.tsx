import { defineAction } from '../functions/ActionFunctions'
import { defineState, getMutableState, none } from '../functions/StateFunctions'
import { Schema } from '../schemas/JSONSchemas'
import { NetworkID, PeerID, UserID } from '../types/Types'
import { NetworkPeer } from './NetworkState'

export class NetworkActions {
  static peerJoined = defineAction({
    type: 'ee.engine.network.PEER_JOINED',
    schema: Schema.Object({
      peerID: Schema.PeerID({ required: true }),
      peerIndex: Schema.Number({ required: true }),
      userID: Schema.UserID({ required: true })
    })
  })

  static peerLeft = defineAction({
    type: 'ee.engine.network.PEER_LEFT',
    schema: Schema.Object({
      peerID: Schema.PeerID({ required: true }),
      userID: Schema.UserID({ required: true })
    })
  })
}

export const NetworkPeerState = defineState({
  name: 'ir.network.NetworkPeerState',
  initial: {} as Record<
    NetworkID,
    {
      peers: Record<PeerID, NetworkPeer>
      peerIndexToPeerID: Record<number, PeerID>
      peerIDToPeerIndex: Record<PeerID, number>
      users: Record<UserID, PeerID[]>
    }
  >,
  receptors: {
    onPeerJoined: NetworkActions.peerJoined.receive((action) => {
      if (!action.$network) return
      const state = getMutableState(NetworkPeerState)
      if (!state.value[action.$network]) {
        state[action.$network].set({
          peers: {},
          peerIDToPeerIndex: {},
          peerIndexToPeerID: {},
          users: {}
        })
      }
      state[action.$network].peers[action.peerID].set({
        peerID: action.peerID,
        peerIndex: action.peerIndex,
        userId: action.userID
      })

      state[action.$network].peerIDToPeerIndex[action.peerID].set(action.peerIndex)
      state[action.$network].peerIndexToPeerID[action.peerIndex].set(action.peerID)

      if (!state[action.$network].users.value[action.userID]) {
        state[action.$network].users.merge({ [action.userID]: [action.peerID] })
      } else {
        if (!state[action.$network].users[action.userID].value!.includes(action.peerID))
          state[action.$network].users[action.userID].merge([action.peerID])
      }
    }),
    onPeerLeft: NetworkActions.peerLeft.receive((action) => {
      if (!action.$network) return
      const state = getMutableState(NetworkPeerState)

      if (!state[action.$network].peers[action.peerID]) {
        console.error(`NetworkPeerState: peer ${action.peerID} not found`)
        return
      }

      // reactively set
      const userID = state[action.$network].peers[action.peerID]!.userId.value

      state[action.$network].peers[action.peerID].set(none)

      const peerIndex = state[action.$network].peerIDToPeerIndex[action.peerID]!.value
      state[action.$network].peerIDToPeerIndex[action.peerID].set(none)
      state[action.$network].peerIndexToPeerID[peerIndex].set(none)

      const userPeers = state[action.$network].users[userID]!
      const index = userPeers.value.indexOf(action.peerID)
      userPeers[index].set(none)

      if (!userPeers.length) state[action.$network].users[userID].set(none)
      if (!state[action.$network].peers.keys.length) state[action.$network].set(none)
    })
  }
})

export const WorldUserState = defineState({
  name: 'ir.network.WorldUserState',
  initial: {} as Record<UserID, Record<NetworkID, PeerID[]>>,
  receptors: {
    onPeerJoined: NetworkActions.peerJoined.receive((action) => {
      const state = getMutableState(WorldUserState)
      if (!action.$network) return
      if (!state.value[action.userID]) {
        state[action.userID].set({})
      }
      if (!state[action.userID].value[action.$network]) {
        state[action.userID].merge({ [action.$network]: [action.peerID] })
      } else {
        if (!state[action.userID][action.$network].value!.includes(action.peerID))
          state[action.userID][action.$network].merge([action.peerID])
      }
    }),
    onPeerLeft: NetworkActions.peerLeft.receive((action) => {
      if (!action.$network) return
      const state = getMutableState(WorldUserState)
      const userPeers = state[action.userID][action.$network]!
      const index = userPeers.value.indexOf(action.peerID)
      userPeers[index].set(none)
      if (!userPeers.length) state[action.userID][action.$network].set(none)
      if (!state[action.userID].keys.length) state[action.userID].set(none)
    })
  }
})
