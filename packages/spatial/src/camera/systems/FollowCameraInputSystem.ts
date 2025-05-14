/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Vector2 } from 'three'

import { Entity } from '@ir-engine/ecs'
import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { CameraPoiMode, CameraSettingsComponent } from '@ir-engine/engine/src/scene/components/CameraSettingsComponent'
import { PoiCameraSettingsComponent } from '@ir-engine/engine/src/scene/components/PoiCameraSettingsComponent'
import { getState, useMutableState } from '@ir-engine/hyperflux'
import { CameraSettings } from '@ir-engine/spatial/src/camera/CameraState'
import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@ir-engine/spatial/src/camera/components/TargetCameraRotationComponent'
import { setTargetCameraRotation } from '@ir-engine/spatial/src/camera/functions/CameraFunctions'
import { FollowCameraMode } from '@ir-engine/spatial/src/camera/types/FollowCameraMode'
import { DefaultAxisBindings, InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { getThumbstickOrThumbpadAxes } from '@ir-engine/spatial/src/input/functions/getThumbstickOrThumbpadAxes'
import { AxisValueMap } from '@ir-engine/spatial/src/input/state/ButtonState'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { Q_Y_180 } from '../../common/constants/MathConstants'
import { smoothDamp } from '../../common/functions/MathFunctions'
import { RendererComponent } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'

// const throttleHandleCameraZoom = throttle(handleFollowCameraZoom, 30, { leading: true, trailing: false })

const pointerPositionDelta = new Vector2()
const followCameraQuery = defineQuery([RendererComponent, FollowCameraComponent])
const cameraSettingsQuery = defineQuery([CameraSettingsComponent])
const poiCameraSettingsQuery = defineQuery([PoiCameraSettingsComponent])
const epsilon = 0.001

// Temporary vectors for POI camera calculations
const targetPosition = new Vector3()
const currentPosition = new Vector3()
const positionVelocity = new Vector3()

const followCameraModeCycle = [
  FollowCameraMode.FirstPerson,
  FollowCameraMode.ShoulderCam,
  FollowCameraMode.ThirdPerson,
  FollowCameraMode.TopDown
] as FollowCameraMode[]

const onFollowCameraModeCycle = (cameraEntity: Entity) => {
  const follow = getMutableComponent(cameraEntity, FollowCameraComponent)
  const mode = follow.mode.value
  const currentModeIdx = followCameraModeCycle.includes(mode) ? followCameraModeCycle.indexOf(mode) : 0
  const nextModeIdx = (currentModeIdx + 1) % followCameraModeCycle.length
  const nextMode = followCameraModeCycle[nextModeIdx]
  follow.mode.set(nextMode)
}

const onFollowCameraFirstPerson = (cameraEntity: Entity) => {
  const followComponent = getMutableComponent(cameraEntity, FollowCameraComponent)
  followComponent.mode.set(FollowCameraMode.FirstPerson)
}

const onFollowCameraShoulderCam = (cameraEntity: Entity) => {
  const follow = getMutableComponent(cameraEntity, FollowCameraComponent)
  follow.mode.set(FollowCameraMode.ShoulderCam)
}

/**
 * Change camera distance or navigate between POIs.
 * @param cameraEntity Entity holding camera and input component.
 * @param cameraSettingsEntity Entity holding camera settings.
 * @param axes Input axes values.
 * @param deltaTime Delta time for smooth transitions.
 */
export const handleFollowCameraScroll = (
  cameraEntity: Entity,
  cameraSettingsEntity: Entity | null,
  axes: AxisValueMap<typeof DefaultAxisBindings>,
  deltaTime: number
): void => {
  const follow = getComponent(cameraEntity, FollowCameraComponent)
  const zoomDelta = axes.FollowCameraZoomScroll ?? 0
  const shoulderDelta = axes.FollowCameraShoulderCamScroll ?? 0

  // Check if we're in POI mode
  if (cameraSettingsEntity) {
    const cameraSettings = getComponent(cameraSettingsEntity, CameraSettingsComponent)

    if (cameraSettings.poiMode === CameraPoiMode.Enabled && Math.abs(zoomDelta) > 0.1) {
      // Filter POI entities to only include those with PoiCameraSettingsComponent
      const validPoiEntities = cameraSettings.poiEntities.filter((entity) =>
        hasComponent(entity, PoiCameraSettingsComponent)
      )

      if (validPoiEntities.length > 0) {
        const mutableCameraSettings = getMutableComponent(cameraSettingsEntity, CameraSettingsComponent)
        let newIndex = cameraSettings.currentPoiIndex

        // Scroll down (negative value) moves to next POI
        if (zoomDelta < 0) {
          newIndex = (newIndex + 1) % validPoiEntities.length
        }
        // Scroll up (positive value) moves to previous POI
        else if (zoomDelta > 0) {
          newIndex = (newIndex - 1 + validPoiEntities.length) % validPoiEntities.length
        }

        // Only update if the index has changed
        if (newIndex !== cameraSettings.currentPoiIndex) {
          mutableCameraSettings.currentPoiIndex.set(newIndex)
        }

        // We've handled the scroll in POI mode, so return early
        return
      }
    }
  }

  // Standard camera zoom behavior if not in POI mode or no valid POIs
  follow.targetDistance = Math.max(follow.targetDistance + zoomDelta, 0)

  // Math.min(
  //   Math.max(follow.targetDistance + zoomDelta, follow.effectiveMinDistance * 0.8),
  //   follow.effectiveMaxDistance * 1.2
  // )

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

  // Get camera settings entity if available
  const cameraSettingsEntities = cameraSettingsQuery()
  const cameraSettingsEntity = cameraSettingsEntities.length > 0 ? cameraSettingsEntities[0] : null

  // Get the viewer entity
  const viewerEntity = getState(ReferenceSpaceState).viewerEntity

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
        InputState.setCapturingEntity(cameraEntity)
        const inputPointer = getComponent(inputPointerEid, InputPointerComponent)
        pointerPositionDelta.copy(inputPointer.movement)
        phi -= pointerPositionDelta.y * cameraSettings.cameraRotationSpeed
        theta -= pointerPositionDelta.x * cameraSettings.cameraRotationSpeed
        time = 0.1
      }
    }

    if (getState(InputState).capturingEntity === cameraEntity) {
      setTargetCameraRotation(cameraEntity, phi, theta, time)
    }
    handleFollowCameraScroll(cameraEntity, cameraSettingsEntity, axes, deltaSeconds)

    // Handle POI camera movement if in POI mode
    if (cameraSettingsEntity && viewerEntity === cameraEntity) {
      const settings = getComponent(cameraSettingsEntity, CameraSettingsComponent)

      if (settings.poiMode === CameraPoiMode.Enabled && settings.currentPoiIndex >= 0) {
        // Filter POI entities to only include those with PoiCameraSettingsComponent
        const validPoiEntities = settings.poiEntities.filter((entity) =>
          hasComponent(entity, PoiCameraSettingsComponent)
        )

        if (validPoiEntities.length > 0 && settings.currentPoiIndex < validPoiEntities.length) {
          const currentPoiEntity = validPoiEntities[settings.currentPoiIndex]
          const poiSettings = getComponent(currentPoiEntity, PoiCameraSettingsComponent)
          const poiTransform = getComponent(currentPoiEntity, TransformComponent)

          if (poiTransform && poiSettings) {
            // Get the POI position
            const poiPosition = poiTransform.position

            // Calculate target position based on POI settings
            const targetDistance = poiSettings.cameraDistance

            // Set camera phi and theta if specified in POI settings
            if (poiSettings.phi !== 0 || poiSettings.theta !== 0) {
              setTargetCameraRotation(cameraEntity, poiSettings.phi, poiSettings.theta)
            }

            // Calculate the desired camera position
            targetPosition.copy(poiPosition)

            // Add any offset specified in the POI settings
            if (poiSettings.cameraOffset) {
              targetPosition.add(poiSettings.cameraOffset)
            }

            // Get current camera position
            const cameraTransform = getComponent(cameraEntity, TransformComponent)
            currentPosition.copy(cameraTransform.position)

            // Smoothly move camera to target position
            const smoothTime = 1.0 / settings.poiLerpSpeed

            // Use smoothDamp for camera movement
            smoothDamp(currentPosition, targetPosition, positionVelocity, smoothTime, deltaSeconds, currentPosition)

            // Update camera position
            const mutableCameraTransform = getMutableComponent(cameraEntity, TransformComponent)
            mutableCameraTransform.position.set(currentPosition)

            // If there's a specific lookAt target, make the camera look at it
            if (poiSettings.lookAtTarget && hasComponent(poiSettings.lookAtTarget, TransformComponent)) {
              const lookAtTransform = getComponent(poiSettings.lookAtTarget, TransformComponent)
              const lookAtPosition = lookAtTransform.position

              // Make camera look at the target
              const direction = new Vector3().subVectors(lookAtPosition, currentPosition).normalize()
              const lookAtQuaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), direction)

              // Update camera rotation
              mutableCameraTransform.rotation.set(lookAtQuaternion)
            } else {
              // Look at the POI itself
              const direction = new Vector3().subVectors(poiPosition, currentPosition).normalize()
              const lookAtQuaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), direction)

              // Update camera rotation
              mutableCameraTransform.rotation.set(lookAtQuaternion)
            }

            // Update camera distance in follow camera component if needed
            const mutableFollowCamera = getMutableComponent(cameraEntity, FollowCameraComponent)
            if (mutableFollowCamera) {
              mutableFollowCamera.targetDistance.set(targetDistance)
              mutableFollowCamera.distance.set(targetDistance)
            }
          }
        }
      }
    }
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
