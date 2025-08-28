import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { MdIntegrationInstructions } from 'react-icons/md'

import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { VisualScriptComponent } from '@ir-engine/engine'
import { Checkbox } from '@ir-engine/ui'
import InputGroup from '../../../input/Group'

export const VisualScriptNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const visualScriptComponent = useComponent(props.entity, VisualScriptComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.visualScript.name')}
      description={t('editor:properties.visualScript.description')}
      Icon={VisualScriptNodeEditor.iconComponent}
    >
      <InputGroup name="Disable Visual Script" label="Disable Visual Script">
        <Checkbox
          checked={visualScriptComponent.disabled}
          onChange={commitProperty(VisualScriptComponent, 'disabled')}
        />
      </InputGroup>
      <InputGroup name="Play Visual Script" label="Play Visual Script">
        <Checkbox checked={visualScriptComponent.run} onChange={commitProperty(VisualScriptComponent, 'run')} />
      </InputGroup>
    </NodeEditor>
  )
}

VisualScriptNodeEditor.iconComponent = MdIntegrationInstructions

export default VisualScriptNodeEditor
