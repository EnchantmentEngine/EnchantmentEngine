import { Quaternion, Vector3 } from 'three'

import {
  defineQuery,
  defineSystem,
  ECSState,
  getComponent,
  getOptionalComponent,
  InputSystemGroup
} from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'

import { FlyControlComponent } from '../../camera/components/FlyControlComponent'
import { Vector3_Up, Vector3_Zero } from '../../common/constants/MathConstants'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'

const EPSILON = 10e-5
const movement = new Vector3()
const direction = new Vector3()
const tempVec3 = new Vector3()
const quat = new Quaternion()
const candidateWorldQuat = new Quaternion()

const flyControlQuery = defineQuery([FlyControlComponent, TransformComponent])

const execute = () => {
  for (const entity of flyControlQuery()) {
    const buttons = InputComponent.getButtons(entity)

    const flyControlComponent = getComponent(entity, FlyControlComponent)
    const transform = getComponent(entity, TransformComponent)

    movement.copy(Vector3_Zero)

    if (buttons.PrimaryClick?.dragging) {
      const pointer = getOptionalComponent(buttons.PrimaryClick.inputSourceEntity, InputPointerComponent)
      if (pointer) {
        movement.x += pointer.movement.x
        movement.y += pointer.movement.y
      }
    }

    if (buttons.SecondaryClick?.dragging) {
      const pointer = getOptionalComponent(buttons.SecondaryClick.inputSourceEntity, InputPointerComponent)
      if (pointer) {
        movement.x += pointer.movement.x
        movement.y += pointer.movement.y
      }
    }

    // rotate about the camera's local x axis
    candidateWorldQuat.multiplyQuaternions(
      quat.setFromAxisAngle(
        tempVec3.set(1, 0, 0).applyQuaternion(transform.rotation),
        movement.y * flyControlComponent.lookSensitivity
      ),
      transform.rotation
    )

    // check change of local "forward" and "up" to disallow flipping
    const camUpY = tempVec3.set(0, 1, 0).applyQuaternion(transform.rotation).y
    const newCamUpY = tempVec3.set(0, 1, 0).applyQuaternion(candidateWorldQuat).y
    const newCamForwardY = tempVec3.set(0, 0, -1).applyQuaternion(candidateWorldQuat).y
    const extrema = Math.sin(flyControlComponent.maxXRotation)
    const allowRotationInX =
      newCamUpY > 0 && ((newCamForwardY < extrema && newCamForwardY > -extrema) || newCamUpY > camUpY)

    if (allowRotationInX) {
      transform.rotation.copy(candidateWorldQuat)
    }

    // rotate about the world y axis
    candidateWorldQuat.multiplyQuaternions(
      quat.setFromAxisAngle(Vector3_Up, -movement.x * flyControlComponent.lookSensitivity),
      transform.rotation
    )

    transform.rotation.copy(candidateWorldQuat)

    const lateralMovement = (buttons.KeyD?.pressed ? 1 : 0) + (buttons.KeyA?.pressed ? -1 : 0)
    const forwardMovement = (buttons.KeyS?.pressed ? 1 : 0) + (buttons.KeyW?.pressed ? -1 : 0)
    const upwardMovement = (buttons.KeyE?.pressed ? 1 : 0) + (buttons.KeyQ?.pressed ? -1 : 0)

    // translate
    direction.set(lateralMovement, 0, forwardMovement)
    direction.applyQuaternion(transform.rotation)
    const boostSpeed = buttons.ShiftLeft?.pressed ? flyControlComponent.boostSpeed : 1
    const deltaSeconds = getState(ECSState).deltaSeconds
    const speed = deltaSeconds * flyControlComponent.moveSpeed * boostSpeed

    if (direction.lengthSq() > EPSILON) transform.position.add(direction.multiplyScalar(speed))

    transform.position.y += upwardMovement * deltaSeconds * flyControlComponent.moveSpeed * boostSpeed
  }
}

export const FlyControlSystem = defineSystem({
  uuid: 'ee.engine.FlyControlSystem',
  insert: { after: InputSystemGroup },
  execute
})
