import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'

export const MultiplayerState = defineState({
  name: 'ir.client.user.MultiplayerState',
  initial: () => ({
    world: true,
    media: true
  }),
  extension: syncStateWithLocalStorage(['world', 'media'])
})
