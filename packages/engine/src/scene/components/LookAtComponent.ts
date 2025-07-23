import { defineComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const LookAtComponent = defineComponent({
  name: 'LookAtComponent',
  jsonID: 'IR_lookAt',

  schema: S.Object({
    target: S.EntityID(),
    xAxis: S.Bool({ default: true }),
    yAxis: S.Bool({ default: true })
  })
})
