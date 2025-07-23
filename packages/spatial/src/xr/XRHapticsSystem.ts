import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { defineActionQueue } from '@ir-engine/hyperflux'

import { InputSourceComponent } from '../input/components/InputSourceComponent'
import { XRAction } from './XRState'

/** haptic typings are currently incomplete */

declare global {
  interface GamepadHapticActuator {
    /**
     * @deprecated old meta quest API
     * @param value A double representing the intensity of the pulse. This can vary depending on the hardware type, but generally takes a value between 0.0 (no intensity) and 1.0 (full intensity).
     * @param duration A double representing the duration of the pulse, in milliseconds.
     */
    pulse?: (value: number, duration: number) => void
  }
}

const inputSourceQuery = defineQuery([InputSourceComponent])

const vibrateControllerQueue = defineActionQueue(XRAction.vibrateController.matches)

const execute = () => {
  for (const action of vibrateControllerQueue()) {
    for (const inputSourceEntity of inputSourceQuery()) {
      const inputSourceComponent = getComponent(inputSourceEntity, InputSourceComponent)
      if (inputSourceComponent.source.gamepad && inputSourceComponent.source.handedness === action.handedness) {
        if ('hapticActuators' in inputSourceComponent.source.gamepad) {
          // old meta quest API
          inputSourceComponent.source.gamepad.hapticActuators?.[0]?.pulse(action.value, action.duration)
          continue
        }

        const actuator = inputSourceComponent.source.gamepad?.vibrationActuator
        if (!actuator) continue
        else actuator.playEffect('dual-rumble', { duration: action.duration })
      }
    }
  }
}

export const XRHapticsSystem = defineSystem({
  uuid: 'ee.engine.XRHapticsSystem',
  insert: { after: PresentationSystemGroup },
  execute
})
