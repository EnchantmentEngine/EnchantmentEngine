import {
  defineComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useEntityContext
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useImmediateEffect } from '@ir-engine/hyperflux'
import { CameraOrbitComponent } from './CameraOrbitComponent'

/**
 * Component for Guided (Point of Interest) camera behavior.
 * This component manages camera state specific to Guided mode navigation.
 */
export const PoiCameraComponent = defineComponent({
  name: 'PoiCameraComponent',
  jsonID: 'IR_poi_camera',

  schema: S.Object({
    // Current Guided navigation state
    currentPoiIndex: S.Number({ default: -1 }),
    targetPoiIndex: S.Number({ default: -1 }),
    poiLerpValue: S.Number({ default: 0 }),

    // Scroll accumulation for manual control
    scrollAccumulator: S.Number({ default: 0 }),

    // Transition state for snapping mode
    isTransitioning: S.Bool({ default: false })
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
