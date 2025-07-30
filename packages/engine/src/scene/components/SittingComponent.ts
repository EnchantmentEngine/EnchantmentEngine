import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const SittingComponent = defineComponent({
  name: 'SittingComponent',

  schema: S.Object({
    mountPointEntity: S.Entity()
  })
})
