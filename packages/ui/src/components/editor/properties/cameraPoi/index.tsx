import { t } from 'i18next'
import React from 'react'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { PoiComponent } from '@ir-engine/engine/src/scene/components/PoiComponent'
import { HiOutlineCamera } from 'react-icons/hi'

export const PoiNodeEditor: EditorComponentType = (props) => {
  const poiSettings = useComponent(props.entity, PoiComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.poiComponent.name', 'POI Component')}
      description={t('editor:properties.poiComponent.description', 'Settings for a point of interest camera view')}
      Icon={PoiNodeEditor.iconComponent}
      entity={props.entity}
    >
      {/*<InputGroup*/}
      {/*  name="hotspotEntities"*/}
      {/*  label={t('editor:properties.poiComponent.lbl-poiHotspotEntities', 'POI Hotspot Entities')}*/}
      {/*>*/}
      {/*  <EntityListInput*/}
      {/*    value={Array.from(poiSettings.hotspotEntityUUIDs.value)}*/}
      {/*    onChange={commitProperty(PoiComponent, 'hotspotEntityUUIDs')}*/}
      {/*    placeholder="Select entities to use as hotspots"*/}
      {/*    filter={[PoiHotspotComponent]}*/}
      {/*    className="w-full"*/}
      {/*  />*/}
      {/*</InputGroup>*/}
    </NodeEditor>
  )
}

PoiNodeEditor.iconComponent = HiOutlineCamera

export default PoiNodeEditor
