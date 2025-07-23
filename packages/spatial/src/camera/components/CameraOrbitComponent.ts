import { defineComponent, Easing, Entity, getMutableComponent, S } from '@ir-engine/ecs'
import { Box3, Vector3 } from 'three'
import { T } from '../../schema/schemaFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'

const delta = new Vector3()
const focusSize = new Vector3()

const MAX_ZOOM_DISTANCE = 1000

export const CameraOrbitComponent = defineComponent({
  name: 'CameraOrbitComponent',

  jsonID: 'IR_camera_orbit',

  schema: S.Object({
    minimumZoomDistance: S.Number({ default: 0.5 }),
    maximumZoomDistance: S.Number({ default: Infinity }),
    zoomSpeed: S.Number({ default: 0.1 }),
    panSpeed: S.Number({ default: 1 }),
    orbitSpeed: S.Number({ default: 5 }),
    cameraOrbitCenter: T.Vec3()
  }),

  setFocus: (cameraEntity: Entity, center: Vector3, bounds?: Box3) => {
    const cameraOrbit = getMutableComponent(cameraEntity, CameraOrbitComponent)
    const zoom = Math.max(cameraOrbit.minimumZoomDistance.value * 10, bounds?.getSize(focusSize).length() ?? 0)
    const transform = getMutableComponent(cameraEntity, TransformComponent)
    // cameraOrbit.cameraOrbitCenter.set(center.clone())
    // transform.position.set(center.clone().add(delta))
    delta.set(0, 0, 1).applyQuaternion(transform.rotation.value).multiplyScalar(Math.min(zoom, MAX_ZOOM_DISTANCE))
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
