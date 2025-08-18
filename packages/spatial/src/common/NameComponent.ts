import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const NameComponent = defineComponent({
  name: 'NameComponent',

  jsonID: 'IR_name',

  schema: S.String({ default: '', required: true, serialized: true })
})
