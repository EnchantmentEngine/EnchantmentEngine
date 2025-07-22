import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const ComputedTransformComponent = defineComponent({
  name: 'ComputedTransformComponent',

  schema: S.Object({
    referenceEntities: S.Array(S.Entity()),
    computeFunction: S.Call()
  })
})
