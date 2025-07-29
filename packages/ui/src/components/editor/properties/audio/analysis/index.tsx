import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@ir-engine/ecs'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { AudioAnalysisComponent } from '@ir-engine/engine/src/scene/components/AudioAnalysisComponent'
import { Checkbox } from '@ir-engine/ui'
import { Slider } from '@ir-engine/ui/editor'
import { SiAudiomack } from 'react-icons/si'
import InputGroup from '../../../input/Group'

export const AudioAnalysisEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const audioAnalysisComponent = useComponent(props.entity, AudioAnalysisComponent)

  return (
    <NodeEditor {...props} name={t('editor:properties.audioAnalysis.name')} Icon={AudioAnalysisEditor.iconComponent}>
      <InputGroup name="Bass" label={t('editor:properties.audioAnalysis.lbl-bassEnabled')}>
        <Checkbox
          checked={audioAnalysisComponent.bassEnabled}
          onChange={commitProperty(AudioAnalysisComponent, 'bassEnabled')}
        />
      </InputGroup>
      <Slider
        min={0}
        max={5}
        step={0.01}
        value={audioAnalysisComponent.bassMultiplier}
        onChange={updateProperty(AudioAnalysisComponent, 'bassMultiplier')}
        onRelease={commitProperty(AudioAnalysisComponent, 'bassMultiplier')}
        aria-label="Bass Multiplier"
        label={t('editor:properties.audioAnalysis.lbl-bassMultiplier')}
      />
      <InputGroup name="Mid Enabled" label={t('editor:properties.audioAnalysis.lbl-midEnabled')}>
        <Checkbox
          checked={audioAnalysisComponent.midEnabled}
          onChange={commitProperty(AudioAnalysisComponent, 'midEnabled')}
        />
      </InputGroup>
      <Slider
        aria-label="Mid Multiplier"
        label={t('editor:properties.audioAnalysis.lbl-midMultiplier')}
        min={0}
        max={5}
        step={0.01}
        value={audioAnalysisComponent.midMultiplier}
        onChange={updateProperty(AudioAnalysisComponent, 'midMultiplier')}
        onRelease={commitProperty(AudioAnalysisComponent, 'midMultiplier')}
      />
      <InputGroup name="Treble Enabled" label={t('editor:properties.audioAnalysis.lbl-trebleEnabled')}>
        <Checkbox
          checked={audioAnalysisComponent.trebleEnabled}
          onChange={commitProperty(AudioAnalysisComponent, 'trebleEnabled')}
        />
      </InputGroup>
      <Slider
        label={t('editor:properties.audioAnalysis.lbl-trebleMultiplier')}
        min={0}
        max={5}
        step={0.01}
        value={audioAnalysisComponent.trebleMultiplier}
        onChange={updateProperty(AudioAnalysisComponent, 'trebleMultiplier')}
        onRelease={commitProperty(AudioAnalysisComponent, 'trebleMultiplier')}
        aria-label="Treble Multiplier"
      />
    </NodeEditor>
  )
}

AudioAnalysisEditor.iconComponent = SiAudiomack

export default AudioAnalysisEditor
