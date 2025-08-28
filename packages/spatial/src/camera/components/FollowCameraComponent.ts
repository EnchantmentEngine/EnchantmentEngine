import { defineQuery, ECSState, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'

import { EntitySchema } from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getMutableState, getState, Schema, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { Clock, MathUtils, Quaternion, Raycaster, Vector3 } from 'three'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { Vector3_Up, Vector3_Zero } from '../../common/constants/MathConstants'
import { createConeOfVectors } from '../../common/functions/MathFunctions'
import { smoothDamp, smootherStep } from '../../common/functions/MathLerpFunctions'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { ObjectLayerComponents } from '../../renderer/components/ObjectLayerComponent'
import { RendererComponent } from '../../renderer/components/RendererComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { T } from '../../schema/schemaFunctions'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraSettingsState } from '../CameraSettingsState'
import { setTargetCameraRotation } from '../functions/CameraFunctions'
import { FollowCameraMode, FollowCameraShoulderSide } from '../types/FollowCameraMode'
import { CameraOrbitComponent } from './CameraOrbitComponent'
import { TargetCameraRotationComponent } from './TargetCameraRotationComponent'

const topDownDefaultPhi = 85

export const FollowCameraComponent = defineComponent({
  name: 'FollowCameraComponent',

  schema: Schema.Object({
    lerpValue: Schema.Number({ default: 0 }),
    originalPosition: T.Vec3(),
    originalOffset: T.Vec3(),
    originalRotation: T.Quaternion(),
    targetRotation: T.Quaternion(),
    targetPosition: T.Vec3(),
    targetOffset: T.Vec3(),
    targetToCamera: T.Vec3(),
    direction: T.Vec3(),
    lookAtMatrix: T.Mat4(),
    firstPersonOffset: T.Vec3(),
    thirdPersonOffset: T.Vec3(),
    currentOffset: T.Vec3(),
    offsetSmoothness: Schema.Number({ default: 0.1 }),
    targetEntity: EntitySchema.Entity(),
    currentTargetPosition: T.Vec3(),
    targetPositionSmoothness: Schema.Number({ default: 0 }),
    mode: Schema.Enum(FollowCameraMode, {
      $comment: "A limited string enum, ie. one of the values listed in the 'allowedModes' property",
      default: FollowCameraMode.ThirdPerson
    }),
    allowedModes: Schema.Array(
      Schema.Enum(FollowCameraMode, { $comment: "A list of allowed string values for the 'mode' property" }),
      {
        default: [
          FollowCameraMode.ThirdPerson,
          FollowCameraMode.FirstPerson,
          FollowCameraMode.TopDown,
          FollowCameraMode.ShoulderCam
        ]
      }
    ),
    distance: Schema.Number({ default: 0 }),
    defaultDistance: Schema.Number({ default: 0 }),
    targetDistance: Schema.Number({ default: 0 }),
    zoomVelocity: Schema.Object({
      value: Schema.Number({ default: 0 })
    }),
    minDistance: Schema.Number({ default: 0 }),
    maxDistance: Schema.Number({ default: 0 }),
    effectiveMinDistance: Schema.Number({ default: 0 }),
    effectiveMaxDistance: Schema.Number({ default: 0 }),
    theta: Schema.Number({ default: 180 }),
    phi: Schema.Number({ default: 10 }),
    minPhi: Schema.Number({ default: 0 }),
    maxPhi: Schema.Number({ default: 0 }),
    minTheta: Schema.Number({ default: 0 }),
    maxTheta: Schema.Number({ default: 0 }),
    defaultTheta: Schema.Number({ default: 0 }),
    defaultPhi: Schema.Number({ default: 0 }),
    locked: Schema.Bool({ default: false }),
    enabled: Schema.Bool({ default: true }),
    shoulderSide: Schema.Enum(FollowCameraShoulderSide, {
      $comment: "Likely a string enum, ie. one of the following values: 'Left', 'Right'",
      default: FollowCameraShoulderSide.Left
    }),
    raycastProps: Schema.Object({
      enabled: Schema.Bool({ default: true }),
      rayCount: Schema.Number({ default: 3 }),
      rayLength: Schema.Number({ default: 15.0 }),
      rayFrequency: Schema.Number({ default: 0.1 }),
      rayConeAngle: Schema.Number({ default: Math.PI / 12 }),
      camRayCastClock: Schema.Class(() => new Clock()),
      camRayCastCache: Schema.Object({
        maxDistance: Schema.Number({ default: -1 }),
        targetHit: Schema.Bool({ default: false })
      }),
      cameraRays: Schema.Array(T.Vec3())
    }),
    pointerLock: Schema.Bool({ default: false }),
    smoothLerp: Schema.Bool({ default: true }),
    accumulatedZoomTriggerDebounceTime: Schema.Number({ default: -1 }),
    lastZoomStartDistance: Schema.Number({ default: 0 }),
    isFreeCamera: Schema.Bool({ default: true }),
    isResetCamera: Schema.Bool({ default: false }),
    lastCameraAdjustmentTime: Schema.Number({ default: -1 }),
    lastCyclePosition: T.Vec3(),
    lastCycleDistance: Schema.Number({ default: 0 }),
    lastCyclePhi: Schema.Number({ default: 0 }),
    lastCycleTheta: Schema.Number({ default: 0 })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const follow = useComponent(entity, FollowCameraComponent)
    const cameraSettingsState = useMutableState(CameraSettingsState)

    const setupModeFirstPerson = () => {
      const cameraSettings = cameraSettingsState.value
      const minTheta = -cameraSettings.firstPersonCameraLimits / 2
      const maxTheta = cameraSettings.firstPersonCameraLimits / 2
      const isFreeCamera = cameraSettings.isFistPersonFreeCamera
      const isResetCamera = cameraSettings.isFirstPersonCameraReset
      const defaultPhi = 0
      const defaultTheta = 0
      const minDistance = 0
      const maxDistance = 0
      const defaultDistance = 0

      follow.distance = defaultDistance
      follow.targetDistance = defaultDistance
      follow.defaultDistance = defaultDistance
      follow.minDistance = minDistance
      follow.maxDistance = maxDistance
      follow.effectiveMinDistance = minDistance
      follow.effectiveMaxDistance = maxDistance
      follow.minPhi = cameraSettings.minPhi
      follow.maxPhi = cameraSettings.maxPhi
      follow.minTheta = minTheta
      follow.maxTheta = maxTheta
      follow.lastZoomStartDistance = (minDistance + maxDistance) / 2
      follow.isFreeCamera = isFreeCamera
      follow.isResetCamera = isResetCamera
      follow.defaultPhi = defaultPhi
      follow.defaultTheta = defaultTheta
      follow.raycastProps.rayLength = maxDistance
    }

    const setupMode = {
      [FollowCameraMode.FirstPerson]: () => setupModeFirstPerson(),
      [FollowCameraMode.ThirdPerson]: () => setupModeThirdPerson(),
      [FollowCameraMode.TopDown]: () => setupModeTopDown()
    }
    const setupModeThirdPerson = () => {
      const cameraSettings = cameraSettingsState.value
      const minTheta = -cameraSettings.thirdPersonCameraLimits / 2
      const maxTheta = cameraSettings.thirdPersonCameraLimits / 2
      const isFreeCamera = cameraSettings.isThirdPersonFreeCamera
      const isResetCamera = cameraSettings.isThirdPersonCameraReset
      const defaultPhi = 0
      const defaultTheta = 0
      const minDistance = cameraSettings.thirdPersonMinDistance
      const maxDistance = cameraSettings.thirdPersonMaxDistance
      const defaultDistance = cameraSettings.thirdPersonDefaultDistance

      follow.distance = defaultDistance
      follow.targetDistance = defaultDistance
      follow.defaultDistance = defaultDistance
      follow.minDistance = minDistance
      follow.maxDistance = maxDistance
      follow.effectiveMinDistance = minDistance
      follow.effectiveMaxDistance = maxDistance
      follow.minPhi = cameraSettings.minPhi
      follow.maxPhi = cameraSettings.maxPhi
      follow.minTheta = minTheta
      follow.maxTheta = maxTheta
      follow.lastZoomStartDistance = (minDistance + maxDistance) / 2
      follow.isFreeCamera = isFreeCamera
      follow.isResetCamera = isResetCamera
      follow.defaultPhi = defaultPhi
      follow.defaultTheta = defaultTheta
      follow.raycastProps.rayLength = maxDistance
    }

    const setupModeTopDown = () => {
      const cameraSettings = cameraSettingsState.value
      const minTheta = -cameraSettings.topDownCameraLimits / 2
      const maxTheta = cameraSettings.topDownCameraLimits / 2
      const isFreeCamera = cameraSettings.isTopDownFreeCamera
      const isResetCamera = cameraSettings.isTopDownCameraReset
      const defaultPhi = topDownDefaultPhi
      const defaultTheta = 0
      const minDistance = cameraSettings.topDownMinDistance
      const maxDistance = cameraSettings.topDownMaxDistance
      const defaultDistance = cameraSettings.topDownDefaultDistance

      follow.distance = defaultDistance
      follow.targetDistance = defaultDistance
      follow.defaultDistance = defaultDistance
      follow.minDistance = minDistance
      follow.maxDistance = maxDistance
      follow.effectiveMinDistance = minDistance
      follow.effectiveMaxDistance = maxDistance
      follow.minPhi = cameraSettings.minPhi
      follow.maxPhi = cameraSettings.maxPhi
      follow.minTheta = minTheta
      follow.maxTheta = maxTheta
      follow.lastZoomStartDistance = (minDistance + maxDistance) / 2
      follow.isFreeCamera = isFreeCamera
      follow.isResetCamera = isResetCamera
      follow.defaultPhi = defaultPhi
      follow.defaultTheta = defaultTheta
      follow.raycastProps.rayLength = maxDistance
    }

    const reconcileMode = () => {
      const mode = follow.mode
      if (!follow.allowedModes.includes(follow.mode)) {
        if (follow.allowedModes.length > 0) {
          follow.mode = follow.allowedModes[0]
        } else {
          follow.mode = FollowCameraMode.ThirdPerson
        }
      }
      return mode !== follow.mode
    }

    //disable orbit camera used for the editor to prevent conflicts / flickering
    useImmediateEffect(() => {
      const preexistingOrbit = hasComponent(entity, CameraOrbitComponent)
      if (preexistingOrbit) removeComponent(entity, CameraOrbitComponent)
      return () => {
        if (preexistingOrbit) setComponent(entity, CameraOrbitComponent)
      }
    }, [])

    useImmediateEffect(() => {
      const cameraSettings = cameraSettingsState.value

      // if (cameraSettings.projectionType === ProjectionType.Orthographic) {
      //   camera.camera = new OrthographicCamera(
      //     data.fov / -2,
      //     data.fov / 2,
      //     data.fov / 2,
      //     data.fov / -2,
      //     data.cameraNearClip,
      //     data.cameraFarClip
      //   )
      // } else if ((camera.camera as PerspectiveCamera).fov) {
      //   ;(camera.camera as PerspectiveCamera).fov = data.fov ?? 50
      // }

      const cameraRays = [] as Vector3[]
      for (let i = 0; i < follow.raycastProps.rayCount; i++) {
        cameraRays.push(new Vector3())
      }
      follow.raycastProps.cameraRays = cameraRays

      const allowedModes: FollowCameraMode[] = []
      if (cameraSettings.canCameraFirstPerson) {
        allowedModes.push(FollowCameraMode.FirstPerson)
      }
      if (cameraSettings.canCameraThirdPerson) {
        allowedModes.push(FollowCameraMode.ThirdPerson)
      }
      if (cameraSettings.canCameraTopDown) {
        allowedModes.push(FollowCameraMode.TopDown)
      }
      follow.allowedModes = allowedModes

      reconcileMode()
      setupMode[follow.mode]()
      initialCameraPlacement(entity)
    }, [cameraSettingsState])

    useEffect(() => {
      const followCamera = getComponent(entity, FollowCameraComponent)

      setComponent(entity, ComputedTransformComponent, {
        referenceEntities: [followCamera.targetEntity],
        computeFunction: () => computeCameraFollow(entity, followCamera.targetEntity)
      })
      return () => {
        removeComponent(entity, ComputedTransformComponent)
        followCamera.originalPosition.copy(Vector3_Zero)
      }
    }, [])

    const rendererComponent = useOptionalComponent(entity, RendererComponent)

    useImmediateEffect(() => {
      if (!follow.pointerLock || !rendererComponent) return

      const canvas = rendererComponent.canvas
      if (!canvas) return

      const onClick = () => {
        if (!hasComponent(entity, RendererComponent)) return
        if (document.pointerLockElement !== canvas) {
          /**
           * @todo - add support for unadjustedMovement API
           *  - https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API#handling_promise_and_non-promise_versions_of_requestpointerlock
           */
          canvas?.requestPointerLock()
        }
      }

      const onPointerLock = () => {
        // console.log('pointer lock')
      }

      const onPointerUnlock = () => {
        // console.log('pointer unlock')
      }

      canvas?.addEventListener('click', onClick)
      document.addEventListener('pointerlockchange', onPointerLock)
      document.addEventListener('pointerlockerror', onPointerUnlock)

      return () => {
        canvas?.removeEventListener('click', onClick)
        document.removeEventListener('pointerlockchange', onPointerLock)
        document.removeEventListener('pointerlockerror', onPointerUnlock)
        document.exitPointerLock()
      }
    }, [follow.pointerLock, !!rendererComponent?.canvas])

    useEffect(() => {
      follow.lerpValue = 0
    }, [follow.targetEntity])

    useEffect(() => {
      if (reconcileMode()) {
        setupMode[follow.mode]()
        initialCameraPlacement(entity)
      }
    }, [follow.allowedModes.length, follow.allowedModes])

    return null
  }
})

const raycaster = new Raycaster()

const MODE_SWITCH_DEBOUNCE = 0.03
const LERP_TIME = 1
const _targetRotation = new Quaternion()
const _targetPosition = new Vector3()

const initialCameraPlacement = (entity: Entity) => {
  const followCamera = getComponent(entity, FollowCameraComponent)
  const followTransform = getComponent(entity, TransformComponent)
  const target = getOptionalComponent(entity, TargetCameraRotationComponent)

  followCamera.phi = followCamera.defaultPhi
  followCamera.theta = followCamera.defaultTheta

  if (target) {
    target.phi = followCamera.defaultPhi
    target.theta = followCamera.defaultTheta
  }

  const thetaRad = MathUtils.degToRad(followCamera.theta)
  const phiRad = MathUtils.degToRad(followCamera.phi)
  followCamera.direction.set(
    Math.sin(thetaRad) * Math.cos(phiRad),
    Math.sin(phiRad),
    Math.cos(thetaRad) * Math.cos(phiRad)
  )

  const newPosition = new Vector3()
    .copy(followCamera.targetOffset)
    .applyQuaternion(TransformComponent.getWorldRotation(followCamera.targetEntity, _targetRotation))
    .add(TransformComponent.getWorldPosition(followCamera.targetEntity, _targetPosition))

  followTransform.position.set(newPosition.x, newPosition.y, newPosition.z)
  followCamera.lookAtMatrix.lookAt(followCamera.direction, Vector3_Zero, Vector3_Up)

  //slerp using rotationLerp value, this is reset to zero every time the follow target changes
  followCamera.targetRotation.setFromRotationMatrix(followCamera.lookAtMatrix)
  followTransform.rotation.copy(followCamera.targetRotation)
  followCamera.originalRotation.copy(followCamera.targetRotation)

  followCamera.originalPosition.copy(followTransform.position)
  followCamera.currentTargetPosition.copy(followTransform.position)
  followCamera.lastCyclePosition.copy(followTransform.position)
}

const computeCameraFollow = (cameraEntity: Entity, referenceEntity: Entity) => {
  const follow = getOptionalComponent(cameraEntity, FollowCameraComponent)
  if (!follow) return
  const cameraTransform = getComponent(cameraEntity, TransformComponent)
  const targetTransform = getOptionalComponent(referenceEntity, TransformComponent)
  const cameraSettings = getMutableState(CameraSettingsState)

  follow.lerpValue =
    follow.mode != FollowCameraMode.FirstPerson && follow.thirdPersonOffset.y === 0
      ? 0
      : Math.min(follow.lerpValue + getState(ECSState).deltaSeconds, LERP_TIME)

  const lerpVal = follow.smoothLerp ? smootherStep(follow.lerpValue / LERP_TIME) : 1

  if (!targetTransform || !follow?.enabled) return

  // Limit the pitch
  follow.phi = Math.min(follow.maxPhi, Math.max(follow.minPhi, follow.phi))

  let isInsideWall = false

  follow.targetOffset =
    follow.mode === FollowCameraMode.FirstPerson
      ? follow.firstPersonOffset
      : follow.thirdPersonOffset.y === 0
      ? follow.targetOffset.set(0, 0, 0)
      : follow.thirdPersonOffset

  const lerpstart =
    follow.originalOffset.distanceToSquared(Vector3_Zero) > 0 ? follow.originalOffset : follow.currentOffset

  follow.currentOffset.lerpVectors(lerpstart, follow.targetOffset, lerpVal)

  follow.targetPosition
    .copy(follow.targetOffset)
    .applyQuaternion(TransformComponent.getWorldRotation(referenceEntity, _targetRotation))
    .add(TransformComponent.getWorldPosition(referenceEntity, _targetPosition))

  follow.currentTargetPosition.lerpVectors(
    follow.originalPosition ?? follow.currentTargetPosition,
    follow.targetPosition,
    lerpVal
  )

  // Run only if not in first person mode
  let obstacleDistance = Infinity
  let obstacleHit = false
  if (follow.raycastProps.enabled && follow.mode !== FollowCameraMode.FirstPerson) {
    const distanceResults = getMaxCamDistance(cameraEntity, follow.currentTargetPosition)
    if (distanceResults.maxDistance > 0.1) {
      obstacleDistance = distanceResults.maxDistance
    }
    isInsideWall = distanceResults.targetHit
    obstacleHit = distanceResults.targetHit
  }

  if (follow.mode === FollowCameraMode.FirstPerson) {
    follow.effectiveMinDistance = follow.effectiveMaxDistance = 0
  } else if (
    follow.mode === FollowCameraMode.ThirdPerson ||
    follow.mode === FollowCameraMode.ShoulderCam ||
    follow.mode === FollowCameraMode.TopDown
  ) {
    follow.effectiveMaxDistance = Math.min(obstacleDistance * (obstacleHit ? 0.8 : 1), follow.maxDistance)
    follow.effectiveMinDistance = Math.min(follow.minDistance, follow.effectiveMaxDistance)
  }

  let newZoomDistance = Math.max(
    Math.min(follow.targetDistance, follow.effectiveMaxDistance),
    follow.effectiveMinDistance
  )

  const constrainTargetDistance = follow.accumulatedZoomTriggerDebounceTime === -1

  if (constrainTargetDistance) {
    follow.targetDistance = newZoomDistance
  }

  const resetMode = {
    [FollowCameraMode.FirstPerson]: () => resetCameraFirstPerson(),
    [FollowCameraMode.ThirdPerson]: () => resetCameraThirdPerson(),
    [FollowCameraMode.TopDown]: () => resetCameraTopDown()
  }
  const resetCameraFirstPerson = () => {
    follow.minDistance = 0
    follow.maxDistance = 0
    follow.defaultDistance = 0
    follow.raycastProps.rayLength = 1
    follow.targetDistance = newZoomDistance = follow.defaultDistance
    follow.maxTheta = cameraSettings.firstPersonCameraLimits.value / 2
    follow.minTheta = -cameraSettings.firstPersonCameraLimits.value / 2
    follow.isFreeCamera = cameraSettings.isFistPersonFreeCamera.value
    follow.isResetCamera = cameraSettings.isFirstPersonCameraReset.value
    follow.defaultPhi = 0
    follow.defaultTheta = 0
    setTargetCameraRotation(cameraEntity, 0, follow.theta)
  }
  const resetCameraThirdPerson = () => {
    follow.minDistance = cameraSettings.thirdPersonMinDistance.value
    follow.maxDistance = cameraSettings.thirdPersonMaxDistance.value
    follow.defaultDistance = cameraSettings.thirdPersonDefaultDistance.value
    follow.raycastProps.rayLength = follow.maxDistance
    follow.targetDistance = newZoomDistance = follow.defaultDistance
    follow.maxTheta = cameraSettings.thirdPersonCameraLimits.value / 2
    follow.minTheta = -cameraSettings.thirdPersonCameraLimits.value / 2
    follow.isFreeCamera = cameraSettings.isThirdPersonFreeCamera.value
    follow.isResetCamera = cameraSettings.isThirdPersonCameraReset.value
    follow.defaultPhi = 0
    follow.defaultTheta = 0
    setTargetCameraRotation(cameraEntity, 0, follow.theta)
  }
  const resetCameraTopDown = () => {
    follow.minDistance = cameraSettings.topDownMinDistance.value
    follow.maxDistance = cameraSettings.topDownMaxDistance.value
    follow.defaultDistance = cameraSettings.topDownDefaultDistance.value
    follow.raycastProps.rayLength = follow.maxDistance
    follow.targetDistance = newZoomDistance = follow.defaultDistance
    follow.maxTheta = cameraSettings.topDownCameraLimits.value / 2
    follow.minTheta = -cameraSettings.topDownCameraLimits.value / 2
    follow.isFreeCamera = cameraSettings.isTopDownFreeCamera.value
    follow.isResetCamera = cameraSettings.isTopDownCameraReset.value
    follow.defaultPhi = topDownDefaultPhi
    follow.defaultTheta = 0
    setTargetCameraRotation(cameraEntity, topDownDefaultPhi, follow.theta)
  }

  const switchToFirstPerson = () => {
    follow.mode = FollowCameraMode.FirstPerson
    resetMode[follow.mode]()
  }
  const switchToThirdPerson = () => {
    follow.mode = FollowCameraMode.ThirdPerson
    resetMode[follow.mode]()
  }
  const switchToTopDown = () => {
    follow.mode = FollowCameraMode.TopDown
    resetMode[follow.mode]()
  }

  const timeInSeconds = Math.floor(Date.now() / 1000)
  const resetThreshold = 3 //in seconds
  if (follow.isResetCamera) {
    if (follow.lastCameraAdjustmentTime !== -1 && follow.lastCameraAdjustmentTime + resetThreshold <= timeInSeconds) {
      resetMode[follow.mode]()
      follow.lastCameraAdjustmentTime = -1
    }
  } else {
    follow.lastCameraAdjustmentTime = -1
  }

  const transitionDistanceThreshold = 0.5
  const triggerZoomShift = follow.accumulatedZoomTriggerDebounceTime > MODE_SWITCH_DEBOUNCE

  if (follow.mode === FollowCameraMode.FirstPerson) {
    newZoomDistance = Math.sqrt(follow.targetDistance) * 0.5

    if (
      !follow.allowedModes.includes(FollowCameraMode.ThirdPerson) &&
      !follow.allowedModes.includes(FollowCameraMode.TopDown)
    ) {
      follow.targetDistance = newZoomDistance = 0
    }

    // Move from first person mode to third person mode
    if (triggerZoomShift) {
      follow.accumulatedZoomTriggerDebounceTime = -1
      const isExitingFirstPerson = newZoomDistance > 0.1 * follow.maxDistance
      if (follow.allowedModes.includes(FollowCameraMode.ThirdPerson) && isExitingFirstPerson) {
        switchToThirdPerson()
      } else if (follow.allowedModes.includes(FollowCameraMode.TopDown) && isExitingFirstPerson) {
        switchToTopDown()
      } else {
        // reset first person mode
        follow.targetDistance = newZoomDistance = 0
      }
    }
  } else if (follow.mode === FollowCameraMode.ThirdPerson) {
    //newZoomDistance = newZoomDistance + minSpringFactor + maxSpringFactor

    if (
      !follow.allowedModes.includes(FollowCameraMode.FirstPerson) &&
      follow.targetDistance < follow.effectiveMinDistance
    ) {
      follow.targetDistance = newZoomDistance = follow.effectiveMinDistance
    }

    if (
      !follow.allowedModes.includes(FollowCameraMode.TopDown) &&
      follow.targetDistance > follow.effectiveMaxDistance
    ) {
      follow.targetDistance = newZoomDistance = follow.effectiveMaxDistance
    }

    if (triggerZoomShift) {
      follow.accumulatedZoomTriggerDebounceTime = -1
      if (
        // Move from third person mode to first person mode
        follow.allowedModes.includes(FollowCameraMode.FirstPerson) &&
        follow.targetDistance < follow.effectiveMinDistance &&
        Math.abs(follow.lastZoomStartDistance - follow.effectiveMinDistance) < transitionDistanceThreshold
      ) {
        switchToFirstPerson()
      } else if (
        // Move from third person mode to top down mode
        follow.allowedModes.includes(FollowCameraMode.TopDown) &&
        follow.targetDistance > follow.effectiveMaxDistance &&
        Math.abs(follow.lastZoomStartDistance - follow.effectiveMaxDistance) < transitionDistanceThreshold
      ) {
        switchToTopDown()
      } else {
        follow.targetDistance = newZoomDistance = Math.max(
          Math.min(follow.targetDistance, follow.effectiveMaxDistance),
          follow.effectiveMinDistance
        )
      }
    }
  } else if (follow.mode === FollowCameraMode.TopDown) {
    //newZoomDistance += minSpringFactor + maxSpringFactor * 0.1

    if (
      !follow.allowedModes.includes(FollowCameraMode.FirstPerson) &&
      !follow.allowedModes.includes(FollowCameraMode.ThirdPerson) &&
      follow.targetDistance < follow.effectiveMinDistance
    ) {
      follow.targetDistance = newZoomDistance = follow.effectiveMinDistance
    }

    if (follow.targetDistance > follow.effectiveMaxDistance) {
      follow.targetDistance = newZoomDistance = follow.effectiveMaxDistance
    }

    // Move from top down mode to third person mode
    if (triggerZoomShift) {
      follow.accumulatedZoomTriggerDebounceTime = -1
      const isExitingTopDown =
        follow.targetDistance < follow.effectiveMaxDistance &&
        Math.abs(follow.lastZoomStartDistance - follow.effectiveMinDistance) < transitionDistanceThreshold
      if (follow.allowedModes.includes(FollowCameraMode.ThirdPerson) && isExitingTopDown) {
        switchToThirdPerson()
      } else if (follow.allowedModes.includes(FollowCameraMode.FirstPerson) && isExitingTopDown) {
        switchToFirstPerson()
      }
    }
  }

  // Zoom smoothing
  const smoothingSpeed = isInsideWall ? 0.1 : 0.3
  const deltaSeconds = getState(ECSState).deltaSeconds

  //multiplying by lerpVal (always between 0 and 1) so we don't instantly apply followdistance to the camera transform when changing targets, but eventually maintain the full value.
  //multiplying by 3 and clamping to 1 so that the follow distance is achieved faster than the rest of the lerp
  follow.distance =
    follow.distance +
    Math.min(lerpVal * 3, 1) *
      smoothDamp(0, newZoomDistance - follow.distance, follow.zoomVelocity, smoothingSpeed, deltaSeconds)

  const thetaRad = MathUtils.degToRad(follow.theta)
  const phiRad = MathUtils.degToRad(follow.phi)

  follow.direction.set(Math.sin(thetaRad) * Math.cos(phiRad), Math.sin(phiRad), Math.cos(thetaRad) * Math.cos(phiRad))

  cameraTransform.position.set(
    follow.currentTargetPosition.x + follow.distance * follow.direction.x,
    follow.currentTargetPosition.y + follow.distance * follow.direction.y,
    follow.currentTargetPosition.z + follow.distance * follow.direction.z
  )

  follow.lookAtMatrix.lookAt(follow.direction, Vector3_Zero, Vector3_Up)

  //slerp using rotationLerp value, this is reset to zero every time the follow target changes
  follow.targetRotation.setFromRotationMatrix(follow.lookAtMatrix)
  cameraTransform.rotation.slerpQuaternions(
    follow.originalRotation ?? cameraTransform.rotation,
    follow.targetRotation,
    lerpVal
  )

  const updatedPosition = new Vector3().copy(cameraTransform.position)
  const updatedDistance = follow.distance
  const updatedPhi = follow.phi
  const updatedTheta = follow.theta

  const positionThreshold = 0.01
  const distanceThreshold = 0.01
  const phiThreshold = 0.01
  const thetaThreshold = 0.01

  if (
    updatedPosition.distanceTo(follow.lastCyclePosition) > positionThreshold ||
    Math.abs(updatedDistance - follow.lastCycleDistance) > distanceThreshold ||
    Math.abs(updatedPhi - follow.lastCyclePhi) > phiThreshold ||
    Math.abs(updatedTheta - follow.lastCycleTheta) > thetaThreshold
  ) {
    follow.lastCameraAdjustmentTime = timeInSeconds
  }

  //update last cycle values to use in checking the camera reset
  follow.lastCyclePosition = updatedPosition
  follow.lastCycleDistance = updatedDistance
  follow.lastCyclePhi = updatedPhi
  follow.lastCycleTheta = updatedTheta

  updateCameraTargetRotation(cameraEntity)
}

const updateCameraTargetRotation = (cameraEntity: Entity) => {
  if (!cameraEntity) return
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)
  const target = getOptionalComponent(cameraEntity, TargetCameraRotationComponent)

  if (!target) return

  if (followCamera.isFreeCamera) {
    target.phi = Math.min(followCamera.maxPhi, Math.max(followCamera.minPhi, target.phi))

    const thetaSwing = Math.abs(followCamera.maxTheta) + Math.abs(followCamera.minTheta)
    if (thetaSwing < 360) {
      target.theta = Math.min(followCamera.maxTheta, Math.max(followCamera.minTheta, target.theta))
    }

    const epsilon = 0.001
    if (Math.abs(target.phi - followCamera.phi) < epsilon && Math.abs(target.theta - followCamera.theta) < epsilon) {
      removeComponent(followCamera.targetEntity, TargetCameraRotationComponent)
      return
    }
  } else {
    target.phi = followCamera.defaultPhi
    target.theta = followCamera.defaultTheta
  }

  const delta = getState(ECSState).deltaSeconds
  if (!followCamera.locked) {
    followCamera.phi = followCamera.smoothLerp
      ? smoothDamp(followCamera.phi, target.phi, target.phiVelocity, target.time, delta)
      : target.phi
    followCamera.theta = followCamera.smoothLerp
      ? smoothDamp(followCamera.theta, target.theta, target.thetaVelocity, target.time, delta)
      : target.theta
  }
}

const cameraLayerQuery = defineQuery([VisibleComponent, ObjectLayerComponents[ObjectLayers.Scene], MeshComponent])

const getMaxCamDistance = (cameraEntity: Entity, target: Vector3) => {
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)

  // Cache the raycast result for 0.1 seconds
  const raycastProps = followCamera.raycastProps
  const { camRayCastCache, camRayCastClock, cameraRays, rayConeAngle } = raycastProps
  if (camRayCastCache.maxDistance != -1 && camRayCastClock.getElapsedTime() < raycastProps.rayFrequency) {
    return camRayCastCache
  }

  camRayCastClock.start()

  const sceneObjects = cameraLayerQuery().flatMap((e) => getComponent(e, MeshComponent))

  // Raycast to keep the line of sight with avatar
  const cameraTransform = getComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent)
  followCamera.targetToCamera.subVectors(cameraTransform.position, target)
  // raycaster.ray.origin.sub(targetToCamVec.multiplyScalar(0.1)) // move origin behind camera

  createConeOfVectors(followCamera.targetToCamera, cameraRays, rayConeAngle)

  let maxDistance = Math.min(followCamera.maxDistance, raycastProps.rayLength)

  // Check hit with mid ray
  raycaster.layers.set(ObjectLayers.Scene)
  raycaster.firstHitOnly = true
  raycaster.far = followCamera.maxDistance
  raycaster.set(target, followCamera.targetToCamera.normalize())
  const hits = raycaster.intersectObjects(sceneObjects, false)

  if (hits[0] && hits[0].distance < maxDistance) {
    maxDistance = hits[0].distance
  }

  //Check the cone for minimum distance
  cameraRays.forEach((rayDir, i) => {
    raycaster.set(target, rayDir)
    const hits = raycaster.intersectObjects(sceneObjects, false)

    if (hits[0] && hits[0].distance < maxDistance) {
      maxDistance = hits[0].distance
    }
  })

  camRayCastCache.maxDistance = maxDistance
  camRayCastCache.targetHit = !!hits[0]

  return camRayCastCache
}
