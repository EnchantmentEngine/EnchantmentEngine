import { useEffect } from 'react'

import { EntitySchema, useEntityContext } from '@ir-engine/ecs'
import { defineComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { getMutableState, getState, Schema } from '@ir-engine/hyperflux'
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

  schema: Schema.Object({
    cameraNearClip: Schema.Number({ default: 0.1 }),
    cameraFarClip: Schema.Number({ default: 1000 }),
    projectionType: Schema.Enum(ProjectionType, {
      $comment:
        "An indexed enum, ie. the numeric index of a value in the following sequence: 'Orthographic', 'Perspective'",
      default: ProjectionType.Perspective
    }),
    fov: Schema.Number({ default: 60 }),

    cameraMode: Schema.Enum(CameraMode, {
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
    minPhi: Schema.Number({ default: -70 }),
    maxPhi: Schema.Number({ default: 85 }),

    isAvatarVisible: Schema.Bool({ default: true }),

    followCameraScrollSensitivity: Schema.Number({ default: 1 }),

    canCameraFirstPerson: Schema.Bool({ default: true }),
    canCameraThirdPerson: Schema.Bool({ default: true }),
    canCameraTopDown: Schema.Bool({ default: true }),

    isFistPersonFreeCamera: Schema.Bool({ default: true }),
    isThirdPersonFreeCamera: Schema.Bool({ default: true }),
    isTopDownFreeCamera: Schema.Bool({ default: false }),

    firstPersonCameraLimits: Schema.Number({ default: 360 }),
    thirdPersonCameraLimits: Schema.Number({ default: 360 }),
    topDownCameraLimits: Schema.Number({ default: 360 }),

    isFirstPersonCameraReset: Schema.Bool({ default: true }),
    isThirdPersonCameraReset: Schema.Bool({ default: true }),
    isTopDownCameraReset: Schema.Bool({ default: true }),

    thirdPersonMinDistance: Schema.Number({ default: 1.5 }),
    thirdPersonMaxDistance: Schema.Number({ default: 50 }),
    thirdPersonDefaultDistance: Schema.Number({ default: 3 }),

    topDownMinDistance: Schema.Number({ default: 10 }),
    topDownMaxDistance: Schema.Number({ default: 70 }),
    topDownDefaultDistance: Schema.Number({ default: 40 }),

    // Fields for Guided camera mode
    poiEntities: Schema.Array(EntitySchema.EntityUUID()),
    poiLerpSpeed: Schema.Number({ default: 0.5 }),
    scrollDeadzone: Schema.Number({ default: 1.0 }),
    scrollSensitivity: Schema.Number({ default: 0.1 }),
    scrollDistancePerPoi: Schema.Number({ default: 3.0 }),
    scrollBehavior: Schema.Enum(CameraScrollBehavior, { default: CameraScrollBehavior.Clamp }),
    poiScrollTransitionType: Schema.Enum(PoiScrollTransition, { default: PoiScrollTransition.Scrolling }),
    enableTransitionButtons: Schema.Bool({ default: false })
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
