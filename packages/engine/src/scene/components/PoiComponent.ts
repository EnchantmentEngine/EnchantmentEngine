import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

/**
 * Component for entities that serve as points of interest for the camera system.
 * This component stores settings related to how the camera should behave when focusing on this POI.
 */
export const PoiComponent = defineComponent({
  name: 'PoiComponent',
  jsonID: 'IR_poi_component',

  schema: S.Object({
    hotspotEntityUUIDs: S.Array(S.EntityUUID(), {
      $comment: 'Optional entities that can be hotspots within this POI'
    })
  })
})
