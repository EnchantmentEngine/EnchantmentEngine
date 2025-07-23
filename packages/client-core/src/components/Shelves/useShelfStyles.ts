import { useMutableState } from '@ir-engine/hyperflux'

import { AppState } from '../../common/services/AppService'
import shelfStyles from './index.module.scss'

export const useShelfStyles = () => {
  const appState = useMutableState(AppState)
  return {
    topShelfStyle: appState.showTopShelf.value ? shelfStyles.animateTop : shelfStyles.fadeOutTop,
    bottomShelfStyle: appState.showBottomShelf.value ? shelfStyles.animateBottom : shelfStyles.fadeOutBottom
  }
}
