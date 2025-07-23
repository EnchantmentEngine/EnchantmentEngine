import { defineState, getState } from '@ir-engine/hyperflux'
import { SerializationSchema } from './Utils'

export const NetworkSchemaState = defineState({
  name: 'NetworkSchemaState',
  initial: {} as { [key: string]: SerializationSchema },

  /** must be explicitly ordered as objects return keys in assignment order */
  get orderedNetworkSchema() {
    return Object.keys(getState(NetworkSchemaState))
      .sort()
      .map((key) => getState(NetworkSchemaState)[key])
  }
})
