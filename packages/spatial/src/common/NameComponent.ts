import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'

export const NameComponent = defineComponent({
  name: 'NameComponent',

  jsonID: 'IR_name',

  schema: Schema.String({ default: '', required: true, serialized: true })
})
