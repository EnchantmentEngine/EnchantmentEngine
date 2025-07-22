import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LuPlayCircle } from 'react-icons/lu'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'

/**
 * SpawnPointNodeEditor component used to provide the editor view to customize Spawn Point properties.
 *
 * @type {Class component}
 */
export const XRUIPlaybackNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  //const spawnComponent = useComponent(props.entity, SpawnPointComponent)

  return (
    <NodeEditor
      name={t('editor:properties.xruiPlayback.name')}
      description={t('editor:properties.xruiPlayback.description')}
      Icon={XRUIPlaybackNodeEditor.iconComponent}
      {...props}
    >
      <InputGroup
        name="Playback Width"
        label={t('editor:properties.xruiPlayback.lbl-playback-width')}
        info={t('editor:properties.xruiPlayback.lbl-playback-width')}
      >
        <NumericInput
          min={0}
          mediumStep={1}
          value={
            //lightComponent.intensity
            0
          }
          onChange={() => {}}
          //onChange={updateProperty(, '')}
          //onRelease={commitProperty(, '')}
          unit="px"
        />
      </InputGroup>
    </NodeEditor>
  )
}

XRUIPlaybackNodeEditor.iconComponent = LuPlayCircle

export default XRUIPlaybackNodeEditor
