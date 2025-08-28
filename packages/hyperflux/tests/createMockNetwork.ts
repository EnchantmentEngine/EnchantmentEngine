import {
  applyIncomingActions,
  dispatchAction,
  getMutableState,
  joinNetwork,
  NetworkActions,
  NetworkID,
  NetworkState,
  NetworkTopics,
  PeerID,
  UserID
} from '@ir-engine/hyperflux'

const instanceID = 'instanceID' as NetworkID

export const createMockNetwork = (
  networkType = NetworkTopics.world,
  hostPeerID = 'hostPeerID' as PeerID | null,
  hostUserID = null as UserID | null
) => {
  if (networkType === NetworkTopics.world) getMutableState(NetworkState).hostIds.world.set(instanceID)
  else getMutableState(NetworkState).hostIds.media.set(instanceID)
  const network = joinNetwork(instanceID, hostPeerID, networkType)

  if (hostPeerID && hostUserID) {
    dispatchAction(
      NetworkActions.peerJoined({
        $network: network.id,
        peerID: hostPeerID,
        peerIndex: 0,
        userID: hostUserID
      })
    )
    applyIncomingActions()
  }
}
