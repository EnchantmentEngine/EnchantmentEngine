import { defineComponent, EntitySchema } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'

export const LookAtComponent = defineComponent({
  name: 'LookAtComponent',
  jsonID: 'IR_lookAt',

  schema: Schema.Object({
    target: EntitySchema.EntityID(),
    xAxis: Schema.Bool({ default: true }),
    yAxis: Schema.Bool({ default: true })
  })
})
