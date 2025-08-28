import { defineComponent, Easing, Entity, getComponent } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { Box3, Vector3 } from 'three'
import { T } from '../../schema/schemaFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'

const delta = new Vector3()
const focusSize = new Vector3()

const MAX_ZOOM_DISTANCE = 1000

export const CameraOrbitComponent = defineComponent({
  name: 'CameraOrbitComponent',

  jsonID: 'IR_camera_orbit',

  schema: Schema.Object({
    minimumZoomDistance: Schema.Number({ default: 0.5 }),
    maximumZoomDistance: Schema.Number({ default: Infinity }),
    zoomSpeed: Schema.Number({ default: 0.1 }),
    panSpeed: Schema.Number({ default: 1 }),
    orbitSpeed: Schema.Number({ default: 5 }),
    cameraOrbitCenter: T.Vec3()
  }),

  setFocus: (cameraEntity: Entity, center: Vector3, bounds?: Box3) => {
    const cameraOrbit = getComponent(cameraEntity, CameraOrbitComponent)
    const zoom = Math.max(cameraOrbit.minimumZoomDistance * 10, bounds?.getSize(focusSize).length() ?? 0)
    const transform = getComponent(cameraEntity, TransformComponent)
    // cameraOrbit.cameraOrbitCenter.set(center.clone())
    // transform.position.set(center.clone().add(delta))
    delta.set(0, 0, 1).applyQuaternion(transform.rotation).multiplyScalar(Math.min(zoom, MAX_ZOOM_DISTANCE))
    CameraOrbitComponent.setTransition(cameraEntity, 'cameraOrbitCenter', center, {
      duration: 600,
      easing: Easing.sine.inOut
    })
    TransformComponent.setTransition(cameraEntity, 'position', center.clone().add(delta), {
      duration: 600,
      easing: Easing.sine.inOut
    })
  }
})
