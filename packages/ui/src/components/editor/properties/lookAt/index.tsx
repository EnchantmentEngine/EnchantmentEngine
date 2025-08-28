import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { FaRegFaceFlushed } from 'react-icons/fa6'

import { EntityID } from '@ir-engine/ecs'
import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { LookAtComponent } from '@ir-engine/engine/src/scene/components/LookAtComponent'
import { Checkbox } from '@ir-engine/ui'
import InputGroup from '../../input/Group'
import NodeInput from '../../input/Node'

/**
 * FacerNodeEditor component used to customize the facer element on the scene
 */
export const LookAtNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const lookAtComponent = useComponent(props.entity, LookAtComponent)

  return (
    <NodeEditor
      entity={props.entity}
      component={LookAtComponent}
      name={t('editor:properties.lookAt.name')}
      description={t('editor:properties.lookAt.description')}
      Icon={LookAtNodeEditor.iconComponent}
    >
      <InputGroup name="Target" label={t('editor:properties.lookAt.target')}>
        <NodeInput
          value={lookAtComponent.target ?? ('' as EntityID)}
          onRelease={commitProperty(LookAtComponent, 'target')}
          onChange={commitProperty(LookAtComponent, 'target')}
        />
      </InputGroup>
      <InputGroup name="X Axis" label={t('editor:properties.lookAt.xAxis')}>
        <Checkbox checked={lookAtComponent.xAxis} onChange={commitProperty(LookAtComponent, 'xAxis')} />
      </InputGroup>
      <InputGroup name="Y Axis" label={t('editor:properties.lookAt.yAxis')}>
        <Checkbox checked={lookAtComponent.yAxis} onChange={commitProperty(LookAtComponent, 'yAxis')} />
      </InputGroup>
    </NodeEditor>
  )
}

LookAtNodeEditor.iconComponent = FaRegFaceFlushed

export default LookAtNodeEditor
