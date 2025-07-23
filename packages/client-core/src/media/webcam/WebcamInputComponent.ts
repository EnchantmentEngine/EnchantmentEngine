import { createResizableTypeArray } from '@ir-engine/ecs/src/bitecsLegacy'

import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'

export type WebcamInputComponentType = {
  expressionValue: number
  expressionIndex: number
}

export const WebcamInputComponent = defineComponent({
  name: 'WebcamInputComponent',

  storage: {
    expressionValue: createResizableTypeArray(Float32Array),
    expressionIndex: createResizableTypeArray(Uint8Array)
  }
})
