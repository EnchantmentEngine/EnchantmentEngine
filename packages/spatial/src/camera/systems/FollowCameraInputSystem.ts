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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Vector2 } from 'three'

import { Entity, UUIDComponent, setComponent } from '@ir-engine/ecs'
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
import { CameraPoiComponent } from '@ir-engine/engine/src/scene/components/CameraPoiComponent'
import {
  CameraScrollBehavior,
  PoiScrollTransition
} from '@ir-engine/engine/src/scene/components/CameraSettingsComponent'
import { getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'
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
import { RendererComponent } from '../../renderer/components/RendererComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraSettingsState } from '../CameraSettingsState'
import { CameraMode } from '../types/CameraMode'

// const throttleHandleCameraZoom = throttle(handleFollowCameraZoom, 30, { leading: true, trailing: false })

const pointerPositionDelta = new Vector2()
const followCameraQuery = defineQuery([RendererComponent, FollowCameraComponent])

// Temporary vectors for POI camera calculations
const targetPosition = new Vector3()
const targetRotation = new Quaternion()

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

  // Check if we're in POI mode
  const cameraSettingsState = getMutableState(CameraSettingsState)

  if (cameraSettingsState.cameraMode.value === CameraMode.POI) {
    // Filter POI entities to only include those with PoiCameraSettingsComponent
    const validPoiEntities = cameraSettingsState.poiEntities.filter((entityId) => {
      const entity = UUIDComponent.getEntityByUUID(entityId.value)
      return entity && hasComponent(entity, CameraPoiComponent)
    })

    if (validPoiEntities.length > 0) {
      // If we don't have a valid target index yet, initialize it
      if (cameraSettingsState.targetPoiIndex.value < 0) {
        cameraSettingsState.targetPoiIndex.set(0)
        cameraSettingsState.currentPoiIndex.set(0)
        cameraSettingsState.poiLerpValue.set(0)
        cameraSettingsState.scrollAccumulator.set(0)
      }

      // Check if we're in snapping mode and a transition is active
      const transitionType = cameraSettingsState.poiScrollTransitionType.value
      const isSnappingMode = transitionType === PoiScrollTransition.Snapping
      const isTransitionActive = isSnappingMode && cameraSettingsState.poiLerpValue.value < 1

      // Lock scroll input during active snapping transitions
      if (isTransitionActive) {
        // We've handled the scroll in POI mode (by ignoring it), so return early
        return
      }

      // Handle manual scroll-based POI navigation
      if (Math.abs(zoomDelta) > 0.01) {
        const scrollSensitivity = cameraSettingsState.scrollSensitivity.value
        const deadzone = cameraSettingsState.scrollDeadzone.value
        const scrollDistancePerPoi = cameraSettingsState.scrollDistancePerPoi.value
        const scrollBehavior = cameraSettingsState.scrollBehavior.value
        const transitionType = cameraSettingsState.poiScrollTransitionType.value

        if (transitionType === PoiScrollTransition.Snapping) {
          // Snap navigation: single scroll increment changes target POI
          const currentTargetIndex = cameraSettingsState.targetPoiIndex.value
          let newTargetIndex = currentTargetIndex

          // Determine scroll direction and update target index
          if (zoomDelta > 0) {
            newTargetIndex = currentTargetIndex + 1
          } else if (zoomDelta < 0) {
            newTargetIndex = currentTargetIndex - 1
          }

          // Handle wrapping or clamping for the new target index
          if (scrollBehavior === CameraScrollBehavior.Wrap) {
            newTargetIndex =
              ((newTargetIndex % validPoiEntities.length) + validPoiEntities.length) % validPoiEntities.length
          } else {
            newTargetIndex = Math.max(0, Math.min(validPoiEntities.length - 1, newTargetIndex))
          }

          // Only update if the target index actually changed
          if (newTargetIndex !== currentTargetIndex) {
            cameraSettingsState.targetPoiIndex.set(newTargetIndex)
            cameraSettingsState.currentPoiIndex.set(currentTargetIndex) // Keep current as the starting point
            cameraSettingsState.poiLerpValue.set(0) // Reset lerp to start transition
          }
        } else {
          // Scrolling navigation: gradual movement between POIs
          // Accumulate scroll distance
          let newScrollAccumulator = cameraSettingsState.scrollAccumulator.value + zoomDelta * scrollSensitivity

          // Helper function to apply smooth deadzone curve around targets
          const applySmoothDeadzone = (
            scrollDelta: number,
            scrollPosition: number,
            totalRange: number,
            isWrapping: boolean
          ) => {
            // Find the nearest POI target position
            const rawPoiSegment = scrollPosition / scrollDistancePerPoi
            const nearestPoiIndex = Math.round(rawPoiSegment)
            const nearestPoiPosition = nearestPoiIndex * scrollDistancePerPoi

            // Calculate distance from the nearest POI center
            let distanceFromCenter = Math.abs(scrollPosition - nearestPoiPosition)

            // For wrapping, we need to consider the wrapped distance as well
            if (isWrapping) {
              const totalScrollRange = validPoiEntities.length * scrollDistancePerPoi
              const wrappedDistance = Math.min(distanceFromCenter, totalScrollRange - distanceFromCenter)
              distanceFromCenter = wrappedDistance
            }

            // Calculate the scroll speed multiplier based on distance from POI center
            // Use a gentle curve that reduces speed near the center but maintains minimum movement
            const halfDeadzone = deadzone / 2
            let speedMultiplier = 1.0

            if (distanceFromCenter < halfDeadzone) {
              // Inside the deadzone - apply gentle curve
              // Use a gentler quadratic curve with minimum speed: 0.2 + 0.8 * (distance / halfDeadzone)^2
              const normalizedDistance = distanceFromCenter / halfDeadzone
              const minSpeed = 0.1 // Minimum speed multiplier (20% of normal speed)
              const speedRange = 0.9 // Range from min to full speed
              speedMultiplier = minSpeed + speedRange * Math.pow(normalizedDistance, 2)
            }

            // Apply the speed multiplier to the scroll delta
            const adjustedScrollDelta = scrollDelta * speedMultiplier
            const newScrollPosition = scrollPosition + adjustedScrollDelta

            return newScrollPosition
          }

          // Helper function to calculate POI indices and lerp value from scroll position
          const calculatePoiState = (scrollPosition: number, isWrapping: boolean) => {
            // Find which POI segment we're in
            const rawPoiSegment = scrollPosition / scrollDistancePerPoi
            const basePoiIndex = Math.floor(rawPoiSegment)
            const segmentProgress = rawPoiSegment - basePoiIndex

            let currentIndex = basePoiIndex
            let targetIndex = basePoiIndex + 1
            let lerpValue = segmentProgress

            // Handle wrapping or clamping for indices
            if (isWrapping) {
              currentIndex =
                ((currentIndex % validPoiEntities.length) + validPoiEntities.length) % validPoiEntities.length
              targetIndex =
                ((targetIndex % validPoiEntities.length) + validPoiEntities.length) % validPoiEntities.length
            } else {
              currentIndex = Math.max(0, Math.min(validPoiEntities.length - 1, currentIndex))
              targetIndex = Math.max(0, Math.min(validPoiEntities.length - 1, targetIndex))

              // Handle edge case at the last POI
              if (currentIndex >= validPoiEntities.length - 1) {
                currentIndex = validPoiEntities.length - 1
                targetIndex = validPoiEntities.length - 1
                lerpValue = 1
              }
            }

            return { currentIndex, targetIndex, lerpValue: Math.max(0, Math.min(1, lerpValue)) }
          }

          if (scrollBehavior === CameraScrollBehavior.Wrap) {
            // Wrap behavior - allow infinite scrolling with wrapping
            const totalScrollRange = validPoiEntities.length * scrollDistancePerPoi
            const currentScrollPosition = cameraSettingsState.scrollAccumulator.value

            // Apply smooth deadzone curve to the scroll delta
            const adjustedScrollPosition = applySmoothDeadzone(
              zoomDelta * scrollSensitivity,
              currentScrollPosition,
              totalScrollRange,
              true
            )

            // Normalize scroll position to wrap around using modulo
            const normalizedScrollPosition =
              ((adjustedScrollPosition % totalScrollRange) + totalScrollRange) % totalScrollRange
            cameraSettingsState.scrollAccumulator.set(normalizedScrollPosition)

            const result = calculatePoiState(normalizedScrollPosition, true)
            cameraSettingsState.currentPoiIndex.set(result.currentIndex)
            cameraSettingsState.targetPoiIndex.set(result.targetIndex)
            cameraSettingsState.poiLerpValue.set(result.lerpValue)
          } else {
            // Clamp behavior - stop at boundaries
            const totalScrollRange = (validPoiEntities.length - 1) * scrollDistancePerPoi
            const currentScrollPosition = cameraSettingsState.scrollAccumulator.value

            // Apply smooth deadzone curve to the scroll delta
            const adjustedScrollPosition = applySmoothDeadzone(
              zoomDelta * scrollSensitivity,
              currentScrollPosition,
              totalScrollRange,
              false
            )

            // Clamp scroll position to valid range
            const clampedScrollPosition = Math.max(0, Math.min(totalScrollRange, adjustedScrollPosition))
            cameraSettingsState.scrollAccumulator.set(clampedScrollPosition)

            const result = calculatePoiState(clampedScrollPosition, false)
            cameraSettingsState.currentPoiIndex.set(result.currentIndex)
            cameraSettingsState.targetPoiIndex.set(result.targetIndex)
            cameraSettingsState.poiLerpValue.set(result.lerpValue)
          }
        }
      }

      // We've handled the scroll in POI mode, so return early
      return
    }
  }
  //possibly get rid of double-click transition
  //add gizmos to the POIs similar to the camera
  //modify camera gizmo so it has an arrow

  /*
  export const EnvMapSourceType = {
    Skybox: 'Skybox' as const,
    Bake: 'Bake' as const,
    Cubemap: 'Cubemap' as const,
    Equirectangular: 'Equirectangular' as const,
    Color: 'Color' as const,
    None: 'None' as const
  }
  */

  if (cameraSettingsState.cameraMode.value === CameraMode.FOLLOW) {
    // Standard camera zoom behavior if not in POI mode or no valid POIs
    follow.targetDistance = Math.max(
      follow.targetDistance + zoomDelta * cameraSettingsState.followCameraScrollSensitivity.value,
      0
    )

    const outsideMinMaxRange =
      follow.targetDistance < follow.effectiveMinDistance || follow.targetDistance > follow.effectiveMaxDistance

    if (
      zoomDelta === 0 &&
      shoulderDelta === 0 &&
      follow.accumulatedZoomTriggerDebounceTime >= 0 &&
      outsideMinMaxRange
    ) {
      follow.accumulatedZoomTriggerDebounceTime += deltaTime
    } else if (Math.abs(zoomDelta) > 0 || Math.abs(shoulderDelta) > 0) {
      if (follow.accumulatedZoomTriggerDebounceTime === -1) {
        follow.lastZoomStartDistance = follow.distance
      }
      follow.accumulatedZoomTriggerDebounceTime = 0
    }
    // We've handled the scroll in DIRECT mode, so return early
    return
  }
}

const execute = () => {
  if (getState(XRState).xrFrame) return

  const deltaSeconds = getState(ECSState).deltaSeconds
  const cameraSettings = getState(CameraSettings)

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
    handleFollowCameraScroll(cameraEntity, axes, deltaSeconds)

    // Handle POI camera movement if in POI mode
    if (viewerEntity === cameraEntity) {
      const settings = getMutableState(CameraSettingsState)

      if (settings.cameraMode.value === CameraMode.POI && settings.poiEntities.length > 0) {
        // Filter POI entities to only include those with PoiCameraSettingsComponent
        const validPoiEntities = settings.poiEntities.filter((entityUUID) =>
          hasComponent(UUIDComponent.getEntityByUUID(entityUUID.value), CameraPoiComponent)
        )

        if (
          validPoiEntities.length > 0 &&
          settings.currentPoiIndex.value >= 0 &&
          settings.currentPoiIndex.value < validPoiEntities.length &&
          settings.targetPoiIndex.value >= 0 &&
          settings.targetPoiIndex.value < validPoiEntities.length
        ) {
          // Handle automatic lerp progression for snap mode
          if (settings.poiScrollTransitionType.value === PoiScrollTransition.Snapping) {
            const currentLerpValue = settings.poiLerpValue.value
            if (currentLerpValue < 1) {
              // Automatically progress the lerp using poiLerpSpeed
              const lerpSpeed = settings.poiLerpSpeed.value
              const newLerpValue = Math.min(1, currentLerpValue + lerpSpeed * deltaSeconds)
              settings.poiLerpValue.set(newLerpValue)

              // When lerp completes, update current index to match target
              if (newLerpValue >= 1) {
                settings.currentPoiIndex.set(settings.targetPoiIndex.value)
              }
            }
          }

          // Get current and target POI entity IDs
          const currentPoiEntityId = validPoiEntities[settings.currentPoiIndex.value].value
          const targetPoiEntityId = validPoiEntities[settings.targetPoiIndex.value].value

          // Get the actual entities from the IDs
          const currentPoiEntity = UUIDComponent.getEntityByUUID(currentPoiEntityId)
          const targetPoiEntity = UUIDComponent.getEntityByUUID(targetPoiEntityId)

          if (!currentPoiEntity || !targetPoiEntity) return

          // Get settings and transforms for both POIs
          const currentPoiTransform = getComponent(currentPoiEntity, TransformComponent)
          const targetPoiTransform = getComponent(targetPoiEntity, TransformComponent)

          if (currentPoiTransform && targetPoiTransform) {
            // Calculate positions for both POIs
            const currentPoiPosition = new Vector3().copy(currentPoiTransform.position)
            const targetPoiPosition = new Vector3().copy(targetPoiTransform.position)

            // Get the lerp value for smooth transitions
            const lerpValue = settings.poiLerpValue.value

            // Interpolate between current and target positions
            targetPosition.lerpVectors(currentPoiPosition, targetPoiPosition, lerpValue)
            targetRotation.slerpQuaternions(currentPoiTransform.rotation, targetPoiTransform.rotation, lerpValue)

            // Update camera position and rotation
            setComponent(cameraEntity, TransformComponent, { position: targetPosition, rotation: targetRotation })
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
