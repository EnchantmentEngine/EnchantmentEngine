import { defineState, getState, NetworkState } from '@ir-engine/hyperflux'
import { SerializationSchema } from './Utils'

export const NetworkSerializationState = defineState({
  name: 'NetworkSerializationState',
  initial: {} as { [key: string]: SerializationSchema },

  /** must be explicitly ordered as objects return keys in assignment order */
  get orderedNetworkSchema() {
    return Object.keys(getState(NetworkState).networkSchema)
      .sort()
      .map((key) => getState(NetworkState).networkSchema[key])
  }
})
