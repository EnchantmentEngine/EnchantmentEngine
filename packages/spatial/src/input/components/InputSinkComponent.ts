import { defineComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

/** InputSinkComponent - receives input from an input entity.  */
export const InputSinkComponent = defineComponent({
  name: 'InputSinkComponent',
  schema: S.Object({ inputEntity: S.Entity() })
})
