import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdScatterPlot } from 'react-icons/md'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { InstancingComponent } from '@ir-engine/engine/src/scene/components/InstancingComponent'

export const InstancingNodeEditor: EditorComponentType = (props: { entity: Entity }) => {
  const { t } = useTranslation()
  const entity = props.entity

  const instancingComponent = useComponent(entity, InstancingComponent)

  return (
    <NodeEditor
      name={t('editor:properties.instancing.name')}
      description={t('editor:properties.instancing.description')}
      Icon={InstancingNodeEditor.iconComponent}
      {...props}
    ></NodeEditor>
  )
}

InstancingNodeEditor.iconComponent = MdScatterPlot

export default InstancingNodeEditor
