import { defineState } from '@ir-engine/hyperflux'

import { EntityUUID } from '@ir-engine/ecs'

import {
  CameraMode,
  CameraModeType,
  CameraScrollBehavior,
  CameraScrollBehaviorType,
  PoiScrollTransition,
  PoiScrollTransitionType
} from './types/CameraMode'
import { ProjectionType } from './types/ProjectionType'

// TODO: don't mix camera settings and follow camera settings
export const CameraSettingsState = defineState({
  name: 'CameraSettingsState',
  initial: {
    fov: 60,
    cameraNearClip: 0.1,
    cameraFarClip: 1000,
    projectionType: ProjectionType.Perspective,
    minPhi: -70,
    maxPhi: 85,
    cameraMode: CameraMode.FOLLOW as CameraModeType,
    poiEntities: [] as EntityUUID[],
    poiLerpSpeed: 0.5,
    // Manual scroll control properties
    scrollDeadzone: 0.3,
    scrollSensitivity: 2.0,
    scrollDistancePerPoi: 3.0,
    scrollBehavior: CameraScrollBehavior.Clamp as CameraScrollBehaviorType,
    poiScrollTransitionType: PoiScrollTransition.Scrolling as PoiScrollTransitionType,
    enableTransitionButtons: false,

    isAvatarVisible: true,
    followCameraScrollSensitivity: 1,

    canCameraFirstPerson: true,
    canCameraThirdPerson: true,
    canCameraTopDown: true,

    isFistPersonFreeCamera: true,
    isThirdPersonFreeCamera: true,
    isTopDownFreeCamera: false,

    firstPersonCameraLimits: 360,
    thirdPersonCameraLimits: 360,
    topDownCameraLimits: 360,

    isFirstPersonCameraReset: true,
    isThirdPersonCameraReset: true,
    isTopDownCameraReset: true,

    thirdPersonMinDistance: 1.5,
    thirdPersonMaxDistance: 50,
    thirdPersonDefaultDistance: 3,

    topDownMinDistance: 10,
    topDownMaxDistance: 70,
    topDownDefaultDistance: 40
  }
})
