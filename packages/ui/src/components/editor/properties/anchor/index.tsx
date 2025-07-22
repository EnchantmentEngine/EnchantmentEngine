import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { PersistentAnchorComponent } from '@ir-engine/spatial/src/xr/XRAnchorComponents'
import { MdAnchor } from 'react-icons/md'
import InputGroup from '../../input/Group'
import StringInput from '../../input/String'

export const PersistentAnchorNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const anchor = useComponent(props.entity, PersistentAnchorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.persistent-anchor.name')}
      description={t('editor:properties.persistent-anchor.description')}
      Icon={PersistentAnchorNodeEditor.iconComponent}
    >
      <InputGroup name="Volume" label={t('editor:properties.persistent-anchor.lbl-name')}>
        <StringInput
          value={anchor.name.value}
          onChange={updateProperty(PersistentAnchorComponent, 'name')}
          onRelease={commitProperty(PersistentAnchorComponent, 'name')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

PersistentAnchorNodeEditor.iconComponent = MdAnchor

export default PersistentAnchorNodeEditor
