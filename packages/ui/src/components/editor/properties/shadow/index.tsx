import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaClone } from 'react-icons/fa6'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'

import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { Checkbox } from '@ir-engine/ui'
import InputGroup from '../../input/Group'

/**
 * ShadowProperties used to create editor view for the properties of ModelNode.
 */
export const ShadowNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const shadowComponent = useComponent(props.entity, ShadowComponent)
  return (
    <NodeEditor
      name={t('editor:properties.shadow.name')}
      component={ShadowComponent}
      description={t('editor:properties.shadow.description')}
      Icon={ShadowNodeEditor.iconComponent}
      {...props}
    >
      <InputGroup name="Cast Shadow" label={t('editor:properties.shadow.lbl-castShadow')}>
        <Checkbox checked={shadowComponent.cast.value} onChange={commitProperty(ShadowComponent, 'cast')} />
      </InputGroup>
      {/**@todo shadow recieving is determined on a per-material basis */
      /* <InputGroup name="Receive Shadow" label={t('editor:properties.shadow.lbl-receiveShadow')}>
        <Checkbox checked={shadowComponent.receive.value} onChange={commitProperty(ShadowComponent, 'receive')} />
      </InputGroup> */}
    </NodeEditor>
  )
}

ShadowNodeEditor.iconComponent = FaClone
export default ShadowNodeEditor
