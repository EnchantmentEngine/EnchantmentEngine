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

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

/**
 * Component for entities that serve as points of interest for the camera system.
 * This component stores settings related to how the camera should behave when focusing on this POI.
 */
export const PoiCameraSettingsComponent = defineComponent({
  name: 'PoiCameraSettingsComponent',
  jsonID: 'EE_poi_camera_settings',

  schema: S.Object({
    // Distance from which the camera should view this POI
    cameraDistance: S.Number({ default: 5 }),

    // Optional entities that can be hotspots within this POI
    hotspotEntities: S.Array(S.Entity(), []),

    // Optional camera position offset when viewing this POI
    cameraOffset: T.Vec3(),

    // Optional camera look-at target (if different from the entity's position)
    lookAtTarget: S.Union([S.Null(), S.Entity()]),

    // Optional camera phi angle when viewing this POI
    phi: S.Number({ default: 0 }),

    // Optional camera theta angle when viewing this POI
    theta: S.Number({ default: 0 })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, PoiCameraSettingsComponent)

    return null
  }
})
