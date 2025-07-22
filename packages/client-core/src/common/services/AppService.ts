import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'

export const AppState = defineState({
  name: 'AppState',
  initial: () => ({
    showTopShelf: true,
    showBottomShelf: true,
    showTouchPad: true
  }),
  extension: syncStateWithLocalStorage(['showTopShelf', 'showBottomShelf'])
})
