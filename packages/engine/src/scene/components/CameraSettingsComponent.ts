import { useEffect } from 'react'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSettingsState'
import {
  CameraMode,
  CameraModeType,
  CameraScrollBehavior,
  PoiScrollTransition
} from '@ir-engine/spatial/src/camera/types/CameraMode'
import { ProjectionType } from '@ir-engine/spatial/src/camera/types/ProjectionType'

export const CameraSettingsComponent = defineComponent({
  name: 'CameraSettingsComponent',
  jsonID: 'EE_camera_settings',

  schema: S.Object({
    cameraNearClip: S.Number({ default: 0.1 }),
    cameraFarClip: S.Number({ default: 1000 }),
    projectionType: S.Enum(ProjectionType, {
      $comment:
        "An indexed enum, ie. the numeric index of a value in the following sequence: 'Orthographic', 'Perspective'",
      default: ProjectionType.Perspective
    }),
    fov: S.Number({ default: 60 }),

    cameraMode: S.Enum(CameraMode, {
      $comment: "An indexed enum, ie. the numeric index of a value in the following sequence: 'FOLLOW', 'GUIDED' ",
      default: CameraMode.FOLLOW,
      deserialize(curr, value) {
        const strValue = value as string
        if (strValue === 'Dynamic') return CameraMode.FOLLOW
        if (strValue === 'POI') return CameraMode.GUIDED

        // Check if value is already a valid CameraMode
        if (Object.values(CameraMode).includes(value as CameraModeType)) {
          return value as CameraModeType
        }

        // Fallback to default if invalid
        return CameraMode.FOLLOW
      }
    }),

    //Fields for FOLLOW camera mode
    minPhi: S.Number({ default: -70 }),
    maxPhi: S.Number({ default: 85 }),

    isAvatarVisible: S.Bool({ default: true }),

    followCameraScrollSensitivity: S.Number({ default: 1 }),

    canCameraFirstPerson: S.Bool({ default: true }),
    canCameraThirdPerson: S.Bool({ default: true }),
    canCameraTopDown: S.Bool({ default: true }),

    isFistPersonFreeCamera: S.Bool({ default: true }),
    isThirdPersonFreeCamera: S.Bool({ default: true }),
    isTopDownFreeCamera: S.Bool({ default: false }),

    firstPersonCameraLimits: S.Number({ default: 360 }),
    thirdPersonCameraLimits: S.Number({ default: 360 }),
    topDownCameraLimits: S.Number({ default: 360 }),

    isFirstPersonCameraReset: S.Bool({ default: true }),
    isThirdPersonCameraReset: S.Bool({ default: true }),
    isTopDownCameraReset: S.Bool({ default: true }),

    thirdPersonMinDistance: S.Number({ default: 1.5 }),
    thirdPersonMaxDistance: S.Number({ default: 50 }),
    thirdPersonDefaultDistance: S.Number({ default: 3 }),

    topDownMinDistance: S.Number({ default: 10 }),
    topDownMaxDistance: S.Number({ default: 70 }),
    topDownDefaultDistance: S.Number({ default: 40 }),

    // Fields for Guided camera mode
    poiEntities: S.Array(S.EntityUUID()),
    poiLerpSpeed: S.Number({ default: 0.5 }),
    scrollDeadzone: S.Number({ default: 1.0 }),
    scrollSensitivity: S.Number({ default: 0.1 }),
    scrollDistancePerPoi: S.Number({ default: 3.0 }),
    scrollBehavior: S.Enum(CameraScrollBehavior, { default: CameraScrollBehavior.Clamp }),
    poiScrollTransitionType: S.Enum(PoiScrollTransition, { default: PoiScrollTransition.Scrolling }),
    enableTransitionButtons: S.Bool({ default: false })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, CameraSettingsComponent)

    for (const prop of Object.keys(getState(CameraSettingsState))) {
      useEffect(() => {
        if (component[prop].value !== undefined && component[prop].value !== getState(CameraSettingsState)[prop]) {
          if (Array.isArray(component[prop].value)) {
            getMutableState(CameraSettingsState)[prop].set(Array.from(component[prop].value))
          } else {
            getMutableState(CameraSettingsState)[prop].set(component[prop].value)
          }
        }
      }, [component[prop].value])
    }

    useEffect(() => {
      if (component.poiScrollTransitionType === PoiScrollTransition.Scrolling) {
        setComponent(
          entity,
          CameraSettingsComponent,
          { enableTransitionButtons: false } // Enable transition buttons for scrolling
        )
      }
    }, [component.poiScrollTransitionType])

    return null
  }
})
