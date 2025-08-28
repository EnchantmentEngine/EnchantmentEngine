import { useEffect } from 'react'

import { UserID } from '@ir-engine/common/src/schema.type.module'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getNearbyUsers } from '@ir-engine/engine/src/avatar/functions/getNearbyUsers'
import { defineState, getMutableState, getState, NetworkState } from '@ir-engine/hyperflux'

import { EngineState } from '@ir-engine/ecs'
import { useMediaNetwork } from '../common/services/MediaInstanceConnectionService'

export const FilteredUsersState = defineState({
  name: 'FilteredUsersState',
  initial: () => ({
    nearbyLayerUsers: [] as UserID[]
  })
})

export const FilteredUsersService = {
  updateNearbyLayerUsers: () => {
    if (!NetworkState.worldNetwork?.peers) return
    const mediaState = getMutableState(FilteredUsersState)
    const peers = Object.values(NetworkState.worldNetwork.peers)
    const worldUserIds = peers
      .filter(
        (peer) => peer.peerID !== NetworkState.worldNetwork.hostPeerID && peer.userId !== getState(EngineState).userID
      )
      .map((peer) => peer.userId)
    const nearbyUsers = getNearbyUsers(getState(EngineState).userID, worldUserIds)
    mediaState.nearbyLayerUsers.set(nearbyUsers)
  }
}

export const updateNearbyAvatars = () => {
  const network = NetworkState.mediaNetwork
  if (!network) return

  FilteredUsersService.updateNearbyLayerUsers()
}

// every 5 seconds
const NEARBY_AVATAR_UPDATE_PERIOD = 5
let accumulator = 0

const execute = () => {
  accumulator += getState(ECSState).deltaSeconds
  if (accumulator > NEARBY_AVATAR_UPDATE_PERIOD) {
    accumulator = 0
    updateNearbyAvatars()
  }
}

const reactor = () => {
  const mediaNetwork = useMediaNetwork()

  useEffect(() => {
    accumulator = NEARBY_AVATAR_UPDATE_PERIOD
  }, [mediaNetwork?.peers])

  return null
}

export const FilteredUsersSystem = defineSystem({
  uuid: 'ee.client.FilteredUsersSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
