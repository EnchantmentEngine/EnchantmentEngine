import { defineState } from '@ir-engine/hyperflux'

export const XruiNameplateState = defineState({
  name: 'XruiNameplateState',
  initial: {
    isVisible: true,
    isInteractable: false,
    triggerDistance: 10,
    defaultNamePlateHeight: 1.5,
    transitionTime: 0.25,
    uiParams: {
      borderRadiusPx: 38,
      bgPaddingPx: 3,
      verticalContentPaddingPx: 5,
      horizontalContentPaddingPx: 40
    }
  }
})
