import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'

import { iOS } from '../../common/functions/isMobile'
import { RendererState } from '../../renderer/RendererState'
import { isMobileXRHeadset } from '../../xr/XRState'

export const getShadowsEnabled = () => {
  const rendererState = getState(RendererState)
  return !isMobileXRHeadset && !iOS && rendererState.useShadows
}

export const useShadowsEnabled = () => {
  const rendererState = getMutableState(RendererState)
  const useShadows = useHookstate(rendererState.useShadows).value
  return !isMobileXRHeadset && !iOS && useShadows
}
