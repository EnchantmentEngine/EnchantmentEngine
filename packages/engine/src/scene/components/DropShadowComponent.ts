import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

export const DropShadowComponent = defineComponent({
  name: 'DropShadowComponent',

  schema: S.Object({
    radius: S.Number(),
    center: T.Vec3(),
    entity: S.Entity()
  })
})
