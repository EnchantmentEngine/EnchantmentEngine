import { EntitySchema } from '@ir-engine/ecs'
import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'

/**
 * Component for entities that serve as points of interest for the camera system.
 * This component stores settings related to how the camera should behave when focusing on this POI.
 */
export const PoiComponent = defineComponent({
  name: 'PoiComponent',
  jsonID: 'IR_poi_component',

  schema: Schema.Object({
    hotspotEntityUUIDs: Schema.Array(EntitySchema.EntityUUID(), {
      $comment: 'Optional entities that can be hotspots within this POI'
    })
  })
})
