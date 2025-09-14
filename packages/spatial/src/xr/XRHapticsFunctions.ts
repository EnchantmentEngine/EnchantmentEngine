import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'

import { InputSourceComponent } from '../input/components/InputSourceComponent'

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

const playEffect = (handedness: 'left' | 'right', value: number, duration: number) => {
  const inputSourceEntity = inputSourceQuery().find((entity) => {
    const inputSourceComponent = getComponent(entity, InputSourceComponent)
    return !!inputSourceComponent.source.gamepad && inputSourceComponent.source.handedness === handedness
  })
  if (!inputSourceEntity) return
  const inputSourceComponent = getComponent(inputSourceEntity, InputSourceComponent)

  if ('hapticActuators' in inputSourceComponent.source.gamepad!) {
    // old meta quest API
    inputSourceComponent.source.gamepad.hapticActuators?.[0]?.pulse(value, duration)
  }

  const actuator = inputSourceComponent.source.gamepad?.vibrationActuator
  if (!actuator) return
  actuator.playEffect('dual-rumble', { duration })
}

export const XRHaptics = {
  playEffect
}
