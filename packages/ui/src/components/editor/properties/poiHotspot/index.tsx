import { t } from 'i18next'
import React from 'react'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { PoiHotspotComponent } from '@ir-engine/engine/src/scene/components/PoiHotspotComponent'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import InputGroup from '../../input/Group'
import StringInput from '../../input/String'

export const PoiHotspotNodeEditor: EditorComponentType = (props) => {
  const hotspotComponent = useComponent(props.entity, PoiHotspotComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.poiHotspot.name', 'Guided Hotspot')}
      description={t('editor:properties.poiHotspot.description', 'Settings for a hotspot within a point of interest')}
      Icon={PoiHotspotNodeEditor.iconComponent}
      entity={props.entity}
    >
      <InputGroup name="title" label={t('editor:properties.poiHotspot.lbl-title', 'Title')}>
        <StringInput
          value={hotspotComponent.title.value}
          onChange={updateProperty(PoiHotspotComponent, 'title')}
          onRelease={commitProperty(PoiHotspotComponent, 'title')}
        />
      </InputGroup>

      <InputGroup name="description" label={t('editor:properties.poiHotspot.lbl-description', 'Description')}>
        <StringInput
          value={hotspotComponent.description.value}
          onChange={updateProperty(PoiHotspotComponent, 'description')}
          onRelease={commitProperty(PoiHotspotComponent, 'description')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

PoiHotspotNodeEditor.iconComponent = HiOutlineLocationMarker

export default PoiHotspotNodeEditor
