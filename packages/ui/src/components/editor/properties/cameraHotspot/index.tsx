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

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { CameraHotspotComponent } from '@ir-engine/engine/src/scene/components/CameraHotspotComponent'
import { NO_PROXY } from '@ir-engine/hyperflux'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import EntityListInput from '../../input/EntityList'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import StringInput from '../../input/String'
import Vector3Input from '../../input/Vector3'

export const PoiHotspotNodeEditor: EditorComponentType = (props) => {
  const hotspotComponent = useComponent(props.entity, CameraHotspotComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.cameraHotspot.name', 'POI Hotspot')}
      description={t(
        'editor:properties.cameraHotspot.description',
        'Settings for a hotspot within a point of interest'
      )}
      Icon={PoiHotspotNodeEditor.iconComponent}
      entity={props.entity}
    >
      <InputGroup name="title" label={t('editor:properties.cameraHotspot.lbl-title', 'Title')}>
        <StringInput
          value={hotspotComponent.title.value}
          onChange={updateProperty(CameraHotspotComponent, 'title')}
          onRelease={commitProperty(CameraHotspotComponent, 'title')}
        />
      </InputGroup>

      <InputGroup name="description" label={t('editor:properties.cameraHotspot.lbl-description', 'Description')}>
        <StringInput
          value={hotspotComponent.description.value}
          onChange={updateProperty(CameraHotspotComponent, 'description')}
          onRelease={commitProperty(CameraHotspotComponent, 'description')}
        />
      </InputGroup>

      <InputGroup
        name="cameraDistance"
        label={t('editor:properties.cameraHotspot.lbl-cameraDistance', 'Camera Distance')}
      >
        <NumericInput
          onChange={updateProperty(CameraHotspotComponent, 'cameraDistance')}
          onRelease={commitProperty(CameraHotspotComponent, 'cameraDistance')}
          min={0.1}
          smallStep={0.1}
          mediumStep={1}
          largeStep={5}
          value={hotspotComponent.cameraDistance.value}
        />
      </InputGroup>

      <InputGroup name="cameraOffset" label={t('editor:properties.cameraHotspot.lbl-cameraOffset', 'Camera Offset')}>
        <Vector3Input
          value={hotspotComponent.cameraOffset.get(NO_PROXY)}
          onChange={updateProperty(CameraHotspotComponent, 'cameraOffset')}
          onRelease={commitProperty(CameraHotspotComponent, 'cameraOffset')}
        />
      </InputGroup>

      <InputGroup name="lookAtTarget" label={t('editor:properties.cameraHotspot.lbl-lookAtTarget', 'Look At Target')}>
        <EntityListInput
          value={hotspotComponent.lookAtTarget.value ? [hotspotComponent.lookAtTarget.value] : []}
          onChange={(entityUUIDs) => {
            const entityUUID = entityUUIDs.length > 0 ? entityUUIDs[0] : null
            commitProperty(CameraHotspotComponent, 'lookAtTarget')(entityUUID)
          }}
          placeholder="Select an entity to look at"
        />
      </InputGroup>

      <InputGroup name="phi" label={t('editor:properties.cameraHotspot.lbl-phi', 'Phi Angle')}>
        <NumericInput
          onChange={updateProperty(CameraHotspotComponent, 'phi')}
          onRelease={commitProperty(CameraHotspotComponent, 'phi')}
          min={-180}
          max={180}
          smallStep={1}
          mediumStep={5}
          largeStep={15}
          value={hotspotComponent.phi.value}
        />
      </InputGroup>

      <InputGroup name="theta" label={t('editor:properties.cameraHotspot.lbl-theta', 'Theta Angle')}>
        <NumericInput
          onChange={updateProperty(CameraHotspotComponent, 'theta')}
          onRelease={commitProperty(CameraHotspotComponent, 'theta')}
          min={-180}
          max={180}
          smallStep={1}
          mediumStep={5}
          largeStep={15}
          value={hotspotComponent.theta.value}
        />
      </InputGroup>
    </NodeEditor>
  )
}

PoiHotspotNodeEditor.iconComponent = HiOutlineLocationMarker

export default PoiHotspotNodeEditor
