import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const NameComponent = defineComponent({
  name: 'NameComponent',

  jsonID: 'IR_name',

  schema: S.String({
    default: ''
    /** @todo - previously this validation never ran because we had a custom onSet, so now it causes problems */
    // validate: NonEmptyString('NameComponent expects a non-empty string')
  })
})
