import { EntitySchema } from '@ir-engine/ecs'
import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

export const DropShadowComponent = defineComponent({
  name: 'DropShadowComponent',

  schema: Schema.Object({
    radius: Schema.Number(),
    center: T.Vec3(),
    entity: EntitySchema.Entity()
  })
})
