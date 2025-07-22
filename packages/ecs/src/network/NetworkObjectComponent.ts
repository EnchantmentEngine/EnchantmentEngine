import { useLayoutEffect } from 'react'

import { OpaqueType, PeerID, UserID } from '@ir-engine/hyperflux'
import { createResizableTypeArray } from '../bitecsLegacy'
import {
  Component,
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '../ComponentFunctions'
import { Engine } from '../Engine'
import { Entity, UndefinedEntity } from '../Entity'
import { defineQuery } from '../QueryFunctions'
import { S } from '../schemas/JSONSchemas'
import { TTypedSchema } from '../schemas/JSONSchemaTypes'
import { proxySoAStore } from '../schemas/proxySoAStore'

export type NetworkId = OpaqueType<'networkId'> & number

/** ID of last network created. */
let availableNetworkId = 0 as NetworkId

export const NetworkSchema = {
  /** NetworkID type schema helper, defaults to 0 */
  NetworkID: (options?: TTypedSchema<NetworkId>['options']) =>
    S.Number({ ...options, id: 'NetworkID' }) as unknown as TTypedSchema<NetworkId>
}

const proxyNetworkId = proxySoAStore(() => NetworkObjectComponent.networkId)

export const NetworkObjectComponent = defineComponent({
  name: 'NetworkObjectComponent',

  schema: S.Object({
    /** The user who is authority over this object. */
    ownerId: S.UserID(),
    ownerPeer: S.PeerID(),
    /** The peer who is authority over this object. */
    authorityPeerID: S.PeerID(),
    /** The network id for this object (this id is only unique per owner) */
    networkId: S.Proxy(NetworkSchema.NetworkID())
  }),

  storage: {
    networkId: createResizableTypeArray(Uint32Array)
  },

  onInit(entity, initial) {
    proxyNetworkId(entity, 'networkId', initial)
    return initial
  },

  reactor: function () {
    const entity = useEntityContext()
    const networkObject = useComponent(entity, NetworkObjectComponent)

    useLayoutEffect(() => {
      if (networkObject.authorityPeerID.value === Engine.instance.store.peerID)
        setComponent(entity, NetworkObjectAuthorityTag)
      else removeComponent(entity, NetworkObjectAuthorityTag)
    }, [networkObject.authorityPeerID])

    useLayoutEffect(() => {
      if (networkObject.ownerId.value === Engine.instance.userID) setComponent(entity, NetworkObjectOwnedTag)
      else removeComponent(entity, NetworkObjectOwnedTag)
    }, [networkObject.ownerId])

    return null
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
  },

  /** Get next network id. */
  createNetworkId(): NetworkId {
    return ++availableNetworkId as NetworkId
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
