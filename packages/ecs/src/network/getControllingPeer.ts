import { HyperFlux, NetworkState, PeerID } from '@ir-engine/hyperflux'

import { getOptionalComponent } from '../ComponentFunctions'
import { Entity } from '../Entity'
import { NetworkObjectComponent } from './NetworkObjectComponent'

/**
 * Get the peer that is the authority of a networked entity
 * If the network is in host mode, the host peer is always the authority peer
 * Otherwise, the current authority peer is the authority peer
 *
 * This allows for easy resolution of authority for any networked object, whether or not the network is in host mode
 *
 * @param entity
 * @param network
 * @returns
 */
export const getAuthorityPeerID = (entity: Entity, network = NetworkState.worldNetwork): PeerID | undefined => {
  if (network.hostPeerID) return network.hostPeerID
  return getOptionalComponent(entity, NetworkObjectComponent)?.authorityPeerID
}

/**
 * Check if a given peer is the authority over a networked entity
 *
 * @param entity
 * @param peerID
 * @param network
 * @returns
 */
export const isAuthorityOverEntity = (
  entity: Entity,
  peerID = HyperFlux.store.peerID,
  network = NetworkState.worldNetwork
): boolean => {
  return peerID === getAuthorityPeerID(entity, network)
}
