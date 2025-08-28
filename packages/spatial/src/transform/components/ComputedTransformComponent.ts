import { EntitySchema } from '@ir-engine/ecs'
import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'

export const ComputedTransformComponent = defineComponent({
  name: 'ComputedTransformComponent',

  schema: Schema.Object({
    referenceEntities: Schema.Array(EntitySchema.Entity()),
    computeFunction: Schema.Func([], Schema.Void())
  })
})
