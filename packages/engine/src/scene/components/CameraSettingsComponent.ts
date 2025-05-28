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

import { useEffect } from 'react'

import { useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSettingsState'
import { CameraMode } from '@ir-engine/spatial/src/camera/types/CameraMode'
import { ProjectionType } from '@ir-engine/spatial/src/camera/types/ProjectionType'
import { PoiUIComponent } from './PoiUIComponent'

// Define scroll behavior for POI navigation
export enum CameraScrollBehavior {
  Wrap = 'Wrap',
  Clamp = 'Clamp'
}

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

    cameraMode: S.Enum(CameraMode, {
      $comment: "An indexed enum, ie. the numeric index of a value in the following sequence: 'DIRECT', 'POI' ",
      default: CameraMode.DIRECT
    }),

    fov: S.Number({ default: 60 }),
    minCameraDistance: S.Number({ default: 1.5 }),
    maxCameraDistance: S.Number({ default: 50 }),
    startCameraDistance: S.Number({ default: 3 }),

    minPhi: S.Number({ default: -70 }),
    maxPhi: S.Number({ default: 85 }),

    // New fields for POI camera mode
    poiEntities: S.Array(S.EntityUUID(), []),
    poiLerpSpeed: S.Number({ default: 0.5 }),
    // Manual scroll control properties
    scrollDeadzone: S.Number({ default: 1.0 }),
    scrollSensitivity: S.Number({ default: 0.1 }),
    scrollDistancePerPoi: S.Number({ default: 3.0 }),
    scrollBehavior: S.Enum(CameraScrollBehavior, { default: CameraScrollBehavior.Clamp })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, CameraSettingsComponent)

    for (const prop of Object.keys(getState(CameraSettingsState))) {
      useEffect(() => {
        if (component[prop].value && component[prop].value !== getState(CameraSettingsState)[prop]) {
          if (Array.isArray(component[prop].value)) {
            getMutableState(CameraSettingsState)[prop].set(Array.from(component[prop].value))
          } else {
            getMutableState(CameraSettingsState)[prop].set(component[prop].value)
          }
        }
      }, [component[prop]])
    }

    useEffect(() => {
      const hasPoiUI = hasComponent(entity, PoiUIComponent)
      if (component.cameraMode.value === CameraMode.POI) {
        if (!hasPoiUI) setComponent(entity, PoiUIComponent)
      } else {
        if (hasPoiUI) removeComponent(entity, PoiUIComponent)
      }
    }, [component.cameraMode])

    return null
  }
})
