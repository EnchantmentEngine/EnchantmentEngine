import { defineComponent, EntitySchema } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'

/** InputSinkComponent - receives input from an input entity.  */
export const InputSinkComponent = defineComponent({
  name: 'InputSinkComponent',
  schema: Schema.Object({ inputEntity: EntitySchema.Entity() })
})
