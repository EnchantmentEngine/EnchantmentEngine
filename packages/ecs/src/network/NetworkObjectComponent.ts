import { OpaqueType, PeerID, Schema, TTypedSchema, UserID } from '@ir-engine/hyperflux'
import { createResizableTypeArray } from '../bitecsLegacy'
import { Component, defineComponent, getComponent, hasComponent } from '../ComponentFunctions'
import { Entity, UndefinedEntity } from '../Entity'
import { proxySoAStore } from '../proxySoAStore'
import { defineQuery } from '../QueryFunctions'

export type NetworkId = OpaqueType<'networkId'> & number

export const NetworkSchema = {
  /** NetworkID type schema helper, defaults to 0 */
  NetworkID: (options?: TTypedSchema<NetworkId>['options']) =>
    Schema.Number({ ...options, $id: 'NetworkID' }) as unknown as TTypedSchema<NetworkId>
}

const proxyNetworkId = proxySoAStore(() => NetworkObjectComponent.networkId)

export const NetworkObjectComponent = defineComponent({
  name: 'NetworkObjectComponent',

  schema: Schema.Object({
    /** The user who is authority over this object. */
    ownerId: Schema.UserID(),
    ownerPeer: Schema.PeerID(),
    /** The peer who is authority over this object. */
    authorityPeerID: Schema.PeerID(),
    /** The network id for this object (this id is only unique per owner) */
    networkId: Schema.Proxy(NetworkSchema.NetworkID())
  }),

  storage: {
    networkId: createResizableTypeArray(Uint32Array)
  },

  onInit(entity, initial) {
    proxyNetworkId(entity, 'networkId', initial)
    return initial
  },

  /**
   * Get the network objects owned by a given user
   * @param ownerId
   */
  getOwnedNetworkObjects(ownerId: UserID) {
    return networkObjectQuery().filter((eid) => getComponent(eid, NetworkObjectComponent).ownerId === ownerId)
  },

  /**
   * Get a network object by ownerPeer and NetworkId
   * @returns
   */
  getNetworkObject(ownerPeer: PeerID, networkId: NetworkId): Entity {
    return (
      networkObjectQuery().find((eid) => {
        const networkObject = getComponent(eid, NetworkObjectComponent)
        return networkObject.networkId === networkId && networkObject.ownerPeer === ownerPeer
      }) || UndefinedEntity
    )
  },

  /**
   * Get the user entity that has a specific component
   * @param userId
   * @param component
   * @returns
   */
  getOwnedNetworkObjectWithComponent(userId: UserID, component: Component) {
    return (
      NetworkObjectComponent.getOwnedNetworkObjects(userId).find((eid) => {
        return hasComponent(eid, component)
      }) || UndefinedEntity
    )
  },

  /**
   * Get the user entity that has a specific component
   * @param userId
   * @param component
   * @returns
   */
  getOwnedNetworkObjectsWithComponent(userId: UserID, component: Component) {
    return NetworkObjectComponent.getOwnedNetworkObjects(userId).filter((eid) => {
      return hasComponent(eid, component)
    })
  }
})

/**
 * Network object query
 */
const networkObjectQuery = defineQuery([NetworkObjectComponent])

/**
 * Authority is peer-specific.
 * Ownership is user-specific.
 * An object is owned by one user, having multiple representations across peers as entities, of which only one is the authority.
 * Authority can be transferred to other peer, including those operated by different users.
 */
export const NetworkObjectAuthorityTag = defineComponent({ name: 'NetworkObjectAuthorityTag' })

export const NetworkObjectOwnedTag = defineComponent({ name: 'NetworkObjectOwnedTag' })

export const NetworkObjectSendPeriodicUpdatesTag = defineComponent({ name: 'NetworkObjectSendPeriodicUpdatesTag' })
