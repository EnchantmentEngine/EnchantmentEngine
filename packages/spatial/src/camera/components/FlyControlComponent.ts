import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const FlyControlComponent = defineComponent({
  name: 'FlyControlComponent',

  schema: S.Object({
    moveSpeed: S.Number({ default: 1 }),
    boostSpeed: S.Number({ default: 1 }),
    lookSensitivity: S.Number({ default: 1 }),
    maxXRotation: S.Number({ default: Math.PI / 2 })
  })
})
