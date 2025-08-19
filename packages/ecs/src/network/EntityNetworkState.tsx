import React, { useLayoutEffect } from 'react'

import {
  createEntity,
  Engine,
  EntityID,
  EntityTreeComponent,
  EntityUUID,
  EntityUUIDPair,
  getOptionalComponent,
  removeComponent,
  removeEntity,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  NetworkPeerState,
  NetworkState,
  none,
  PeerID,
  SceneUser,
  useHookstate,
  useMutableState,
  UserID
} from '@ir-engine/hyperflux'
import { EngineState } from '../EngineState'
import {
  NetworkId,
  NetworkObjectAuthorityTag,
  NetworkObjectComponent,
  NetworkObjectOwnedTag
} from './NetworkObjectComponent'
import { WorldNetworkAction } from './WorldNetworkAction'

export const EntityNetworkState = defineState({
  name: 'ee.EntityNetworkState',

  initial: {} as Record<
    EntityUUID,
    {
      entityID: EntityID
      entitySourceID: SourceID
      parentUUID: EntityUUID
      ownerId: UserID | typeof SceneUser
      ownerPeer: PeerID
      authorityPeerId?: PeerID
      requestingPeerId?: PeerID
    }
  >,

  receptors: {
    onSpawnObject: WorldNetworkAction.spawnEntity
      .receive((action) => {
        const uuid = { entityID: action.entityID, entitySourceID: action.entitySourceID } as EntityUUIDPair
        getMutableState(EntityNetworkState)[UUIDComponent.join(uuid)].merge({
          parentUUID: action.parentUUID,
          ownerId: action.ownerID,
          authorityPeerId: action.authorityPeerId ?? action.$peer,
          ownerPeer: action.$peer,
          entityID: action.entityID,
          entitySourceID: action.entitySourceID
        })
      })
      .validate((action) => {
        if (action.ownerID !== action.$user) return false
        return true
      }),

    onRequestAuthorityOverObject: WorldNetworkAction.requestAuthorityOverObject.receive((action) => {
      getMutableState(EntityNetworkState)[action.entityUUID].requestingPeerId.set(action.newAuthority)
    }),

    onTransferAuthorityOfObject: WorldNetworkAction.transferAuthorityOfObject
      .receive((action) => {
        const state = getMutableState(EntityNetworkState)
        state[action.entityUUID].authorityPeerId.set(action.newAuthority)
        state[action.entityUUID].requestingPeerId.set(none)
      })
      .validate((action) => {
        const fromUserId = action.ownerID
        const ownerUserId = getState(EntityNetworkState)[action.entityUUID].ownerId
        // Authority transfer can only be initiated by owner, unless the owner is the scene user
        if ((ownerUserId !== action.$user && ownerUserId !== SceneUser) || ownerUserId !== fromUserId) return false
        return true
      }),

    onDestroyObject: WorldNetworkAction.destroyEntity
      .receive((action) => {
        getMutableState(EntityNetworkState)[action.entityUUID].set(none)
      })
      .validate((action) => {
        const owner = getState(EntityNetworkState)[action.entityUUID]?.ownerId
        if (owner && owner !== action.$user) return false
        return true
      })
  },

  reactor: () => {
    const state = useMutableState(EntityNetworkState)
    return (
      <>
        {state.keys.map((uuid: EntityUUID) => (
          <EntityNetworkReactor uuid={uuid} key={uuid} />
        ))}
      </>
    )
  }
})

const EntityNetworkReactor = (props: { uuid: EntityUUID }) => {
  const state = useHookstate(getMutableState(EntityNetworkState)[props.uuid])
  const ownerID = state.ownerId.value
  const userID = useMutableState(EngineState).userID.value
  const isOwner = ownerID === SceneUser || ownerID === userID
  const worldNetwork = useHookstate(NetworkState.worldNetworkState).value
  const networkPeerState = useMutableState(NetworkPeerState).value
  const userHasPeer = !!(worldNetwork && networkPeerState[worldNetwork.id]?.users?.[ownerID])
  const userConnected = userHasPeer || isOwner
  const networkID = useNetworkID(props.uuid)

  useLayoutEffect(() => {
    if (!userConnected) return

    const idPair = {
      entityID: state.entityID.value,
      entitySourceID: state.entitySourceID.value
    }

    const uuid = UUIDComponent.join(idPair)

    let entity = UUIDComponent.getEntityByUUID(uuid)

    if (!entity) {
      entity = createEntity()
      setComponent(entity, UUIDComponent, idPair)
    }

    return () => {
      removeEntity(entity)
    }
  }, [userConnected])

  useLayoutEffect(() => {
    if (!userConnected) return
    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    const parentEntity = UUIDComponent.getEntityByUUID(state.parentUUID.value)
    if (!parentEntity || !entity) return
    setComponent(entity, EntityTreeComponent, { parentEntity })
  }, [userConnected, state.parentUUID])

  useLayoutEffect(() => {
    if (!userConnected) return
    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    if (!entity) return

    setComponent(entity, NetworkObjectComponent, {
      ownerId: ownerID,
      ownerPeer: state.ownerPeer.value,
      authorityPeerID: state.authorityPeerId.value,
      networkId: networkID
    })
  }, [!!worldNetwork, userConnected, state.ownerId.value, state.authorityPeerId.value, networkID])

  useLayoutEffect(() => {
    if (!userConnected || !state.requestingPeerId.value) return
    // Authority request can only be processed by owner

    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    if (!entity) return
    const ownerID = getOptionalComponent(entity, NetworkObjectComponent)?.ownerId
    if ((!ownerID || ownerID !== userID) && ownerID !== SceneUser) return
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        ownerID: state.ownerId.value,
        entityUUID: props.uuid,
        newAuthority: state.requestingPeerId.value
      })
    )
  }, [userConnected, state.requestingPeerId.value])

  useLayoutEffect(() => {
    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    if (state.authorityPeerId.value === Engine.instance.store.peerID) setComponent(entity, NetworkObjectAuthorityTag)
    else removeComponent(entity, NetworkObjectAuthorityTag)
  }, [state.authorityPeerId.value])

  useLayoutEffect(() => {
    const entity = UUIDComponent.getEntityByUUID(props.uuid)
    if (state.ownerId.value === Engine.instance.userID) setComponent(entity, NetworkObjectOwnedTag)
    else removeComponent(entity, NetworkObjectOwnedTag)
  }, [state.ownerId.value])

  const authorityPeer = state.authorityPeerId.value ?? state.ownerPeer.value
  const isAuthorInNetwork = !!(worldNetwork && networkPeerState[worldNetwork.id]?.peers[authorityPeer])

  /**
   * If the authority peer does not exist in the network, and we are the owner user,
   * dispatch a spawn action so we take authority over the object
   */
  useLayoutEffect(() => {
    if (!isOwner || !isAuthorInNetwork) return

    return () => {
      // ensure entity still exists
      if (!NetworkState.worldNetwork) return
      if (!getState(EntityNetworkState)[props.uuid]) return
      if (!getState(NetworkPeerState)[NetworkState.worldNetwork.id]?.users?.[userID]?.length) return

      // Use the lowest peer as the new authority
      const lowestPeer = [...NetworkState.worldNetwork.users[userID]].sort((a, b) => (a > b ? 1 : -1))[0]
      if (lowestPeer !== Engine.instance.store.peerID) return

      dispatchAction(
        WorldNetworkAction.transferAuthorityOfObject({
          ownerID: state.ownerId.value,
          entityUUID: props.uuid,
          newAuthority: Engine.instance.store.peerID
        })
      )
    }
  }, [isOwner, isAuthorInNetwork])

  return null
}

/**
 * Get a deterministic network ID scoped to each owner peer
 * @todo this causes temporary desync when a new entity is spawned, as network IDs may change
 */
const useNetworkID = (uuid: EntityUUID) => {
  const state = useMutableState(EntityNetworkState)
  const ownerPeer = state[uuid].ownerPeer.value
  const entitiesForPeer = state.keys.filter((key: EntityUUID) => state[key].ownerPeer.value === ownerPeer).sort()
  return entitiesForPeer.indexOf(uuid) as NetworkId
}
