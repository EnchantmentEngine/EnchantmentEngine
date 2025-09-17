import { useEffect } from 'react'
import { MathUtils } from 'three'

import { getComponent, removeComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { dispatchAction, getMutableState, getState, startReactor, useHookstate } from '@ir-engine/hyperflux'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { XRStandardGamepadAxes, XRStandardGamepadButton } from '@ir-engine/spatial/src/input/state/ButtonState'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { createXRUI } from '@ir-engine/spatial/src/xrui/createXRUI'
import { WidgetAppActions } from './WidgetAppService'
import { Widget, Widgets } from './Widgets'

import { defineQuery } from '@ir-engine/ecs'
import { Pin02Lg } from '@ir-engine/ui/src/icons'
import { AnchorWidgetUI } from './ui/AnchorWidgetUI'

const instanceSourceQuery = defineQuery([InputSourceComponent])

export function createAnchorWidget() {
  const ui = createXRUI(AnchorWidgetUI)
  removeComponent(ui.entity, VisibleComponent)
  const xrState = getMutableState(XRState)

  const widget: Widget = {
    ui,
    label: 'World Anchor',
    icon: Pin02Lg,
    onOpen: () => {
      xrState.scenePlacementMode.set('placing')
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: false }))
    },
    system: () => {
      if (xrState.session.value?.interactionMode !== 'world-space') return
      if (xrState.scenePlacementMode.value !== 'placing') return
      const preferredHand = getState(InputState).preferredHand

      // const scenePlacementEntity = getState(XRAnchorSystemState).scenePlacementEntity
      // const inputSourceEntities = getComponent(scenePlacementEntity, InputComponent).inputSources
      // console.log(inputSourceEntities)
      for (const inputEntity of instanceSourceQuery()) {
        const inputComponent = getComponent(inputEntity, InputSourceComponent)
        if (inputComponent.source.gamepad?.mapping !== 'xr-standard') continue
        if (inputComponent.source.handedness !== preferredHand) continue

        const buttonInputPressed = inputComponent.buttons[XRStandardGamepadButton.XRStandardGamepadTrigger]?.down

        if (buttonInputPressed) {
          xrState.scenePlacementMode.set('placed')
          return
        }

        const { deltaSeconds } = getState(ECSState)

        const xAxisInput = inputComponent.source.gamepad.axes[XRStandardGamepadAxes.XRStandardGamepadThumbstickX]
        const yAxisInput = inputComponent.source.gamepad.axes[XRStandardGamepadAxes.XRStandardGamepadThumbstickY]

        const xDelta = xAxisInput * Math.PI * deltaSeconds
        getMutableState(XRState).sceneRotationOffset.set((currentValue) => currentValue + xDelta)

        if (!xrState.sceneScaleAutoMode.value) {
          const yDelta = -yAxisInput * deltaSeconds * 0.1
          xrState.sceneScaleTarget.set((currentValue) => MathUtils.clamp(currentValue + yDelta, 0.01, 0.2))
        }

        const stickButtonPressed = inputComponent.buttons[XRStandardGamepadButton.XRStandardGamepadStick]?.down
        if (stickButtonPressed) {
          xrState.sceneScaleAutoMode.set(!xrState.sceneScaleAutoMode.value)
          if (!xrState.sceneScaleAutoMode.value) {
            xrState.sceneScaleTarget.set(0.2)
          }
        }
      }
    },
    cleanup: async () => {}
  }

  const id = Widgets.registerWidget(ui.entity, widget)

  const reactor = startReactor(() => {
    const sessionMode = useHookstate(getMutableState(XRState).sessionMode)

    useEffect(() => {
      const widgetEnabled = sessionMode.value === 'immersive-ar'
      dispatchAction(WidgetAppActions.enableWidget({ id, enabled: widgetEnabled }))
    }, [sessionMode])

    return null
  }, `createAnchorWidget`)
}
