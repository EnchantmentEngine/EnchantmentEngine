import { defineState } from '@ir-engine/hyperflux'

export const LoadingSystemState = defineState({
  name: 'LoadingSystemState',
  initial: () => ({
    loadingScreenVisible: false
  })
})
