import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

/**
 * Component for entities that serve as hotspots within a POI.
 * This component stores metadata for hotspots such as title and description.
 */
export const PoiHotspotComponent = defineComponent({
  name: 'PoiHotspotComponent',
  jsonID: 'IR_poi_hotspot_component',

  schema: S.Object({
    title: S.String({ default: '', $comment: 'Optional title or label for this hotspot' }),
    description: S.String({ default: '', $comment: 'Optional description for this hotspot' })
  })
})
