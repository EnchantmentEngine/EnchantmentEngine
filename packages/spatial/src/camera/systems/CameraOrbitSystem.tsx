import { Matrix3, Spherical, Vector3 } from 'three'

import {
  defineSystem,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  InputSystemGroup,
  query
} from '@ir-engine/ecs'
import { isClient } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { InputComponent } from '../../input/components/InputComponent'
import { InputPointerComponent } from '../../input/components/InputPointerComponent'
import { MouseScroll } from '../../input/state/ButtonState'
import { RendererComponent } from '../../renderer/components/RendererComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'

const delta = new Vector3()
const normalMatrix = new Matrix3()
const spherical = new Spherical()

// const throttleZoom = throttle(doZoom, 30, { leading: true, trailing: false })
const orbitCameraQueryTerms = [RendererComponent, CameraOrbitComponent, InputComponent]

const execute = () => {
  if (!isClient) return

  for (const cameraEid of query(orbitCameraQueryTerms)) {
    const cameraOrbit = getMutableComponent(cameraEid, CameraOrbitComponent)

    const buttons = InputComponent.getButtons(cameraEid)
    const axes = InputComponent.getAxes(cameraEid)

    const orbiting = buttons.PrimaryClick
    const panning = buttons.AuxiliaryClick

    // TODO: handle multi-touch pinch/zoom
    const zoom = axes[MouseScroll.VerticalScroll]

    const transform = getComponent(cameraEid, TransformComponent)
    const editorCameraCenter = cameraOrbit.cameraOrbitCenter
    const distance = transform.position.distanceTo(editorCameraCenter)
    const camera = getComponent(cameraEid, CameraComponent)
    // distance <= cameraOrbit.maximumZoomDistance && distance >= cameraOrbit.minimumZoomDistance
    if (zoom) {
      delta.set(0, 0, zoom * distance * cameraOrbit.zoomSpeed)
      if (delta.length() < distance) {
        delta.applyMatrix3(normalMatrix.getNormalMatrix(camera.matrixWorld))

        const newPosition = transform.position.clone().add(delta)
        const newDistance = newPosition.distanceTo(editorCameraCenter)

        if (newDistance >= cameraOrbit.minimumZoomDistance && newDistance <= cameraOrbit.maximumZoomDistance) {
          transform.position.copy(newPosition)
        }
      }
    }

    if (panning?.pressed) {
      const inputPointer = getOptionalComponent(panning.inputSourceEntity, InputPointerComponent)
      const movement = inputPointer?.movement
      if (movement) {
        const distance = transform.position.distanceTo(editorCameraCenter)
        delta
          .set(-movement.x, -movement.y, 0)
          .multiplyScalar(Math.max(distance, 1) * cameraOrbit.panSpeed)
          .applyMatrix3(normalMatrix.getNormalMatrix(camera.matrix))
        transform.position.add(delta)
        editorCameraCenter.add(delta)
      }
    }

    if (orbiting?.dragging && !orbiting.up) {
      const inputPointer = getOptionalComponent(orbiting.inputSourceEntity, InputPointerComponent)
      const movement = inputPointer?.movement
      if (movement) {
        delta.copy(transform.position).sub(editorCameraCenter)
        spherical.setFromVector3(delta)
        spherical.theta -= movement.x * cameraOrbit.orbitSpeed
        spherical.phi += movement.y * cameraOrbit.orbitSpeed
        spherical.makeSafe()
        delta.setFromSpherical(spherical)
        transform.position.copy(editorCameraCenter).add(delta)
        transform.matrix.lookAt(transform.position, editorCameraCenter, Vector3_Up)
        transform.rotation.setFromRotationMatrix(transform.matrix)
      }
    }
  }
}

export const CameraOrbitSystem = defineSystem({
  uuid: 'ee.engine.CameraOrbitSystem',
  insert: { after: InputSystemGroup },
  execute
})
