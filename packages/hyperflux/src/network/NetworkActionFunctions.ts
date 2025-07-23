import {
  Action,
  addOutgoingTopicIfNecessary,
  clearOutgoingActions,
  dispatchAction,
  getState,
  HyperFlux,
  PeerID
} from '@ir-engine/hyperflux'

import { Network, NetworkState } from './NetworkState'

const receiveIncomingActions = (network: Network, fromPeerID: PeerID, actions: Required<Action>[]) => {
  if (network.isHosting) {
    for (const a of actions) {
      a.$peer = fromPeerID
      const peerUser = network.peers[fromPeerID]?.userId
      if (peerUser) a.$user = peerUser
      a.$network = network.id
      dispatchAction(a)
    }
  } else {
    for (const a of actions) {
      // if the action is not from the host, override the $peer field to ensure we can validate correctly later
      if (fromPeerID !== network.hostPeerID) {
        a.$peer = fromPeerID
        const peerUser = network.peers[fromPeerID]?.userId
        if (peerUser) a.$user = peerUser
      }
      HyperFlux.store.actions.incoming.push(a)
    }
  }
}

const sendActionsAsPeer = (network: Network) => {
  const outgoing = HyperFlux.store.actions.outgoing[network.topic]
  if (!outgoing?.queue?.length) return
  const actions = [] as Action[]
  for (const action of outgoing.queue) {
    if (action.$network && !action.$topic && action.$network === network.id) action.$topic = network.topic
    if (action.$to === HyperFlux.store.peerID) continue
    actions.push(action)
  }
  // in unhosted networks, we send to all peers
  if (!network.hostPeerID) {
    const actionsByTo = actions.reduce(
      (acc, action) => {
        if (!action.$to) return acc
        const toPeers = Array.isArray(action.$to) ? action.$to : [action.$to]
        for (const toPeer of toPeers) {
          if (!acc[toPeer]) acc[toPeer] = []
          acc[toPeer].push(action)
        }
        return acc
      },
      {} as Record<PeerID | 'all', Action[]>
    )

    for (const [peerID, actions] of Object.entries(actionsByTo)) {
      if (peerID === 'all') {
        for (const peerID of Object.keys(network.peers) as PeerID[]) {
          network.messageToPeer(peerID, actions)
        }
      } else {
        network.messageToPeer(peerID as PeerID, actions)
      }
    }
  } else {
    network.messageToPeer(network.hostPeerID!, actions)
  }
  clearOutgoingActions(network.topic)
}

const sendActionsAsHost = (network: Network) => {
  addOutgoingTopicIfNecessary(network.topic)

  const actions = [...HyperFlux.store.actions.outgoing[network.topic].queue]
  if (!actions.length) return

  for (const peerID of Object.keys(network.peers) as PeerID[]) {
    const arr: Action[] = []
    for (const a of [...actions]) {
      const action = { ...a }
      if (action.$network) {
        if (action.$network !== network.id) continue
        else action.$topic = network.topic
      }
      if (!action.$to) continue
      if (action.$to === 'all' || action.$to === peerID) {
        arr.push(action)
      }
    }
    if (arr.length)
      network.messageToPeer(
        peerID,
        /*encode(*/ arr //)
      )
  }

  // TODO: refactor this to support multiple connections of the same topic type
  clearOutgoingActions(network.topic)
}

const sendOutgoingActions = () => {
  for (const network of Object.values(getState(NetworkState).networks)) {
    try {
      if (HyperFlux.store.peerID === network.hostPeerID) sendActionsAsHost(network as Network)
      else sendActionsAsPeer(network as Network)
    } catch (e) {
      console.error(e)
    }
  }
}

export const NetworkActionFunctions = {
  sendActionsAsPeer,
  sendActionsAsHost,
  sendOutgoingActions,
  receiveIncomingActions
}
