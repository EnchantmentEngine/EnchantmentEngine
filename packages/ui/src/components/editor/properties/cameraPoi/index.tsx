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

import { t } from 'i18next'
import React from 'react'

import { hasComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { Entity } from '@ir-engine/ecs'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { CameraHotspotComponent } from '@ir-engine/engine/src/scene/components/CameraHotspotComponent'
import { CameraPoiComponent } from '@ir-engine/engine/src/scene/components/CameraPoiComponent'
import { NO_PROXY } from '@ir-engine/hyperflux'
import { HiOutlineCamera } from 'react-icons/hi'
import EntityListInput from '../../input/EntityList'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import Vector3Input from '../../input/Vector3'

export const CameraPoiNodeEditor: EditorComponentType = (props) => {
  const poiSettings = useComponent(props.entity, CameraPoiComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.cameraPoi.name', 'POI Camera Settings')}
      description={t('editor:properties.cameraPoi.description', 'Settings for a point of interest camera view')}
      Icon={CameraPoiNodeEditor.iconComponent}
      entity={props.entity}
    >
      <InputGroup name="cameraDistance" label={t('editor:properties.cameraPoi.lbl-cameraDistance', 'Camera Distance')}>
        <NumericInput
          onChange={updateProperty(CameraPoiComponent, 'cameraDistance')}
          onRelease={commitProperty(CameraPoiComponent, 'cameraDistance')}
          min={0.1}
          smallStep={0.1}
          mediumStep={1}
          largeStep={5}
          value={poiSettings.cameraDistance.value}
        />
      </InputGroup>

      <InputGroup name="cameraOffset" label={t('editor:properties.cameraPoi.lbl-cameraOffset', 'Camera Offset')}>
        <Vector3Input
          value={poiSettings.cameraOffset.get(NO_PROXY)}
          onChange={updateProperty(CameraPoiComponent, 'cameraOffset')}
          onRelease={commitProperty(CameraPoiComponent, 'cameraOffset')}
        />
      </InputGroup>

      <InputGroup name="lookAtTarget" label={t('editor:properties.cameraPoi.lbl-lookAtTarget', 'Look At Target')}>
        <EntityListInput
          value={poiSettings.lookAtTarget.value ? [poiSettings.lookAtTarget.value] : []}
          onChange={(entityUUIDs) => {
            const entityUUID = entityUUIDs.length > 0 ? entityUUIDs[0] : null
            commitProperty(CameraPoiComponent, 'lookAtTarget')(entityUUID)
          }}
          placeholder="Select an entity to look at"
          className="w-full"
        />
      </InputGroup>

      <InputGroup name="phi" label={t('editor:properties.cameraPoi.lbl-phi', 'Phi Angle')}>
        <NumericInput
          onChange={updateProperty(CameraPoiComponent, 'phi')}
          onRelease={commitProperty(CameraPoiComponent, 'phi')}
          min={-180}
          max={180}
          smallStep={1}
          mediumStep={5}
          largeStep={15}
          value={poiSettings.phi.value}
        />
      </InputGroup>

      <InputGroup name="theta" label={t('editor:properties.cameraPoi.lbl-theta', 'Theta Angle')}>
        <NumericInput
          onChange={updateProperty(CameraPoiComponent, 'theta')}
          onRelease={commitProperty(CameraPoiComponent, 'theta')}
          min={-180}
          max={180}
          smallStep={1}
          mediumStep={5}
          largeStep={15}
          value={poiSettings.theta.value}
        />
      </InputGroup>

      <InputGroup
        name="hotspotEntities"
        label={t('editor:properties.cameraPoi.lbl-hotspotEntities', 'Hotspot Entities')}
      >
        <EntityListInput
          value={Array.from(poiSettings.hotspotEntityUUIDs.value)}
          onChange={commitProperty(CameraPoiComponent, 'hotspotEntityUUIDs')}
          placeholder="Select entities to use as hotspots"
          filter={(entity: Entity) => hasComponent(entity, CameraHotspotComponent)}
          className="w-full"
        />
      </InputGroup>
    </NodeEditor>
  )
}

CameraPoiNodeEditor.iconComponent = HiOutlineCamera

export default CameraPoiNodeEditor
