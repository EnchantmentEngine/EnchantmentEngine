import { useComponent } from '@ir-engine/ecs'
import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SpawnPointComponent } from '@ir-engine/engine/src/scene/components/SpawnPointComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { RiCameraLensFill } from 'react-icons/ri'

/**
 * SpawnPointNodeEditor component used to provide the editor view to customize Spawn Point properties.
 */
export const SpawnPointNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const spawnComponent = useComponent(props.entity, SpawnPointComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.spawnPoint.name')}
      description={t('editor:properties.spawnPoint.description')}
      Icon={SpawnPointNodeEditor.iconComponent}
    ></NodeEditor>
  )
}

SpawnPointNodeEditor.iconComponent = RiCameraLensFill

export default SpawnPointNodeEditor
