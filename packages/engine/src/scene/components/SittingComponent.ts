import { EntitySchema } from '@ir-engine/ecs'
import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'

export const SittingComponent = defineComponent({
  name: 'SittingComponent',

  schema: Schema.Object({
    mountPointEntity: EntitySchema.Entity()
  })
})
