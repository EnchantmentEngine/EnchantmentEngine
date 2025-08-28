import {
  defineComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useEntityContext
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema, useImmediateEffect } from '@ir-engine/hyperflux'
import { CameraOrbitComponent } from './CameraOrbitComponent'

/**
 * Component for Guided (Point of Interest) camera behavior.
 * This component manages camera state specific to Guided mode navigation.
 */
export const PoiCameraComponent = defineComponent({
  name: 'PoiCameraComponent',
  jsonID: 'IR_poi_camera',

  schema: Schema.Object({
    // Current Guided navigation state
    currentPoiIndex: Schema.Number({ default: -1 }),
    targetPoiIndex: Schema.Number({ default: -1 }),
    poiLerpValue: Schema.Number({ default: 0 }),

    // Scroll accumulation for manual control
    scrollAccumulator: Schema.Number({ default: 0 }),

    // Transition state for snapping mode
    isTransitioning: Schema.Bool({ default: false })
  }),

  reactor: () => {
    const entity = useEntityContext()

    //disable orbit camera used for the editor to prevent conflicts / flickering
    useImmediateEffect(() => {
      const preexistingOrbit = hasComponent(entity, CameraOrbitComponent)
      if (preexistingOrbit) removeComponent(entity, CameraOrbitComponent)
      return () => {
        if (preexistingOrbit) setComponent(entity, CameraOrbitComponent)
      }
    }, [])
  }
})
