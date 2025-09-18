import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'

export const FlyControlComponent = defineComponent({
  name: 'FlyControlComponent',

  schema: Schema.Object({
    moveSpeed: Schema.Number({ default: 1 }),
    boostSpeed: Schema.Number({ default: 1 }),
    lookSensitivity: Schema.Number({ default: 1 }),
    maxXRotation: Schema.Number({ default: Math.PI / 2 })
  })
})
