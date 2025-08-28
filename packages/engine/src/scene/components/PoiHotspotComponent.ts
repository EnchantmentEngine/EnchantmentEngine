import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'

/**
 * Component for entities that serve as hotspots within a POI.
 * This component stores metadata for hotspots such as title and description.
 */
export const PoiHotspotComponent = defineComponent({
  name: 'PoiHotspotComponent',
  jsonID: 'IR_poi_hotspot_component',

  schema: Schema.Object({
    title: Schema.String({ default: '', $comment: 'Optional title or label for this hotspot' }),
    description: Schema.String({ default: '', $comment: 'Optional description for this hotspot' })
  })
})
