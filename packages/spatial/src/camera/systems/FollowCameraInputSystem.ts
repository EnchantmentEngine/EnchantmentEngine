import { Vector2 } from 'three'

import { Entity } from '@ir-engine/ecs'
import { getComponent, getOptionalComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'
import { CameraSettings } from '@ir-engine/spatial/src/camera/CameraState'
import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@ir-engine/spatial/src/camera/components/TargetCameraRotationComponent'
import { FollowCameraMode } from '@ir-engine/spatial/src/camera/types/FollowCameraMode'
import { DefaultAxisBindings, InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { getThumbstickOrThumbpadAxes } from '@ir-engine/spatial/src/input/functions/getThumbstickOrThumbpadAxes'
import { AxisValueMap } from '@ir-engine/spatial/src/input/state/ButtonState'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { useEffect } from 'react'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { Q_Y_180 } from '../../common/constants/MathConstants'
import { RendererComponent } from '../../renderer/components/RendererComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraSettingsState } from '../CameraSettingsState'

const pointerPositionDelta = new Vector2()
const followCameraQuery = defineQuery([RendererComponent, FollowCameraComponent])

const followCameraModeCycle = [
  FollowCameraMode.FirstPerson,
  FollowCameraMode.ShoulderCam,
  FollowCameraMode.ThirdPerson,
  FollowCameraMode.TopDown
] as FollowCameraMode[]

const onFollowCameraModeCycle = (cameraEntity: Entity) => {
  const follow = getComponent(cameraEntity, FollowCameraComponent)
  const mode = follow.mode
  const currentModeIdx = followCameraModeCycle.includes(mode) ? followCameraModeCycle.indexOf(mode) : 0
  const nextModeIdx = (currentModeIdx + 1) % followCameraModeCycle.length
  const nextMode = followCameraModeCycle[nextModeIdx]
  follow.mode = nextMode
}

const onFollowCameraFirstPerson = (cameraEntity: Entity) => {
  const followComponent = getComponent(cameraEntity, FollowCameraComponent)
  followComponent.mode = FollowCameraMode.FirstPerson
}

const onFollowCameraShoulderCam = (cameraEntity: Entity) => {
  const follow = getComponent(cameraEntity, FollowCameraComponent)
  follow.mode = FollowCameraMode.ShoulderCam
}

/**
 * Change camera distance for follow camera mode.
 * @param cameraEntity Entity holding camera and input component.
 * @param axes Input axes values.
 * @param deltaTime Delta time for smooth transitions.
 */
export const handleFollowCameraScroll = (
  cameraEntity: Entity,
  axes: AxisValueMap<typeof DefaultAxisBindings>,
  deltaTime: number
): void => {
  const follow = getComponent(cameraEntity, FollowCameraComponent)
  const zoomDelta = axes.FollowCameraZoomScroll ?? 0
  const shoulderDelta = axes.FollowCameraShoulderCamScroll ?? 0

  const cameraSettingsState = getMutableState(CameraSettingsState)

  // Standard camera zoom behavior for follow mode
  follow.targetDistance = Math.max(
    follow.targetDistance + zoomDelta * cameraSettingsState.followCameraScrollSensitivity.value,
    0
  )

  const outsideMinMaxRange =
    follow.targetDistance < follow.effectiveMinDistance || follow.targetDistance > follow.effectiveMaxDistance

  if (zoomDelta === 0 && shoulderDelta === 0 && follow.accumulatedZoomTriggerDebounceTime >= 0 && outsideMinMaxRange) {
    follow.accumulatedZoomTriggerDebounceTime += deltaTime
  } else if (Math.abs(zoomDelta) > 0 || Math.abs(shoulderDelta) > 0) {
    if (follow.accumulatedZoomTriggerDebounceTime === -1) {
      follow.lastZoomStartDistance = follow.distance
    }
    follow.accumulatedZoomTriggerDebounceTime = 0
  }
}

const execute = () => {
  if (getState(XRState).xrFrame) return

  const deltaSeconds = getState(ECSState).deltaSeconds
  const cameraSettings = getState(CameraSettings)

  for (const cameraEntity of followCameraQuery()) {
    const buttons = InputComponent.getButtons(cameraEntity)
    const axes = InputComponent.getAxes(cameraEntity)

    const inputPointerEntities = InputPointerComponent.getPointersForCamera(cameraEntity)
    const inputState = getState(InputState)
    const follow = getComponent(cameraEntity, FollowCameraComponent)

    let { theta, phi } = getOptionalComponent(cameraEntity, TargetCameraRotationComponent) ?? follow
    let time = 0.3

    const canvas = getComponent(cameraEntity, RendererComponent).canvas

    const hasPointerLock = follow.pointerLock && document.pointerLockElement === canvas

    if (buttons?.FollowCameraModeCycle?.down) onFollowCameraModeCycle(cameraEntity)
    if (buttons?.FollowCameraFirstPerson?.down) onFollowCameraFirstPerson(cameraEntity)
    if (buttons?.FollowCameraShoulderCam?.down) onFollowCameraShoulderCam(cameraEntity)

    const keyDelta = (buttons?.ArrowLeft ? 1 : 0) + (buttons?.ArrowRight ? -1 : 0)
    theta += 100 * deltaSeconds * keyDelta

    for (const inputPointerEid of inputPointerEntities) {
      const inputSource = getComponent(inputPointerEid, InputSourceComponent)
      const [x, y] = getThumbstickOrThumbpadAxes(inputSource.source, inputState.preferredHand)
      theta -= x * 2
      phi += y * 2
      const pointerDragging = inputSource.buttons?.PrimaryClick?.dragging
      if (pointerDragging || hasPointerLock) {
        const inputPointer = getComponent(inputPointerEid, InputPointerComponent)
        pointerPositionDelta.copy(inputPointer.movement)
        phi -= pointerPositionDelta.y * cameraSettings.cameraRotationSpeed
        theta -= pointerPositionDelta.x * cameraSettings.cameraRotationSpeed
        time = 0.1
      }

      if (pointerDragging || hasPointerLock) {
        setComponent(cameraEntity, TargetCameraRotationComponent, { phi, theta, time })
      }
    }

    handleFollowCameraScroll(cameraEntity, axes, deltaSeconds)
  }
}

const reactor = () => {
  const xrSession = useMutableState(XRState).session.value

  useEffect(() => {
    if (!xrSession) return

    const { localFloorEntity, viewerEntity } = getState(ReferenceSpaceState)

    /**
     * Upon entering a new XR session, we need to update the world origin to match the local floor.
     */
    const worldOriginTransform = getComponent(localFloorEntity, TransformComponent)
    const cameraAttachedEntity = getOptionalComponent(viewerEntity, FollowCameraComponent)?.targetEntity || viewerEntity
    const transform = getComponent(cameraAttachedEntity, TransformComponent)

    /**
     * Since the world origin is based on gamepad movement, we need to transform it by the pose of Whatever the camera is currently following
     */
    worldOriginTransform.position.copy(transform.position)
    worldOriginTransform.rotation.copy(transform.rotation).multiply(Q_Y_180)
  }, [xrSession])

  return null
}

export const FollowCameraInputSystem = defineSystem({
  uuid: 'ee.engine.FollowCameraInputSystem',
  insert: { after: InputSystemGroup },
  execute,
  reactor
})
