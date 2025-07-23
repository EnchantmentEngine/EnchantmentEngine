import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaSquareFull } from 'react-icons/fa6'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { GroundPlaneComponent } from '@ir-engine/engine/src/scene/components/GroundPlaneComponent'
import { Checkbox } from '@ir-engine/ui'
import ColorInput from '../../../../primitives/tailwind/Color'
import InputGroup from '../../input/Group'

export const GroundPlaneNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const groundPlaneComponent = useComponent(props.entity, GroundPlaneComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.groundPlane.name')}
      description={t('editor:properties.groundPlane.description')}
      Icon={GroundPlaneNodeEditor.iconComponent}
    >
      <InputGroup name="Color" label={t('editor:properties.groundPlane.lbl-color')}>
        <ColorInput
          sketchPickerClassName="mt-2"
          value={groundPlaneComponent.color.value}
          onChange={updateProperty(GroundPlaneComponent, 'color')}
          onRelease={commitProperty(GroundPlaneComponent, 'color')}
        />
      </InputGroup>
      <InputGroup
        name="Visible"
        className={'my-4'}
        label={t('editor:properties.groundPlane.lbl-visible')}
        info={t('editor:properties.groundPlane.info-visible')}
      >
        <Checkbox
          checked={groundPlaneComponent.visible.value}
          onChange={commitProperty(GroundPlaneComponent, 'visible')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

GroundPlaneNodeEditor.iconComponent = FaSquareFull

export default GroundPlaneNodeEditor
