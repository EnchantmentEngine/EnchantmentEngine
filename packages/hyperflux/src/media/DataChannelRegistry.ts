import { defineState, getMutableState, getState, none, OpaqueType, PeerID } from '@ir-engine/hyperflux'

import { Network } from '../network/NetworkState'

export type DataChannelType = OpaqueType<'DataChannelType'> & string

type RegistryFunction = (network: Network, dataChannel: DataChannelType, fromPeerID: PeerID, message: any) => void

export const DataChannelRegistryState = defineState({
  name: 'ee.engine.network.DataChannelRegistryState',
  initial: {} as Record<DataChannelType, RegistryFunction[]>
})

export const addDataChannelHandler = (dataChannelType: DataChannelType, handler: RegistryFunction) => {
  if (!getState(DataChannelRegistryState)[dataChannelType]) {
    getMutableState(DataChannelRegistryState).merge({ [dataChannelType]: [] })
  }
  getState(DataChannelRegistryState)[dataChannelType].push(handler)
}

export const removeDataChannelHandler = (dataChannelType: DataChannelType, handler: RegistryFunction) => {
  if (!getState(DataChannelRegistryState)[dataChannelType]) return

  const index = getState(DataChannelRegistryState)[dataChannelType].indexOf(handler)
  if (index === -1) return

  getState(DataChannelRegistryState)[dataChannelType].splice(index, 1)

  if (getState(DataChannelRegistryState)[dataChannelType].length === 0) {
    getMutableState(DataChannelRegistryState)[dataChannelType].set(none)
  }
}
