import React from 'react'
import { useTranslation } from 'react-i18next'

import { HemisphereLightComponent } from '@ir-engine/spatial/src/renderer/components/lights/HemisphereLightComponent'

import { useComponent } from '@ir-engine/ecs'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { PiSunHorizon } from 'react-icons/pi'
import ColorInput from '../../../../../primitives/tailwind/Color'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'

/**
 * HemisphereLightNodeEditor used to provide property customization view for Hemisphere Light.
 */
export const HemisphereLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const lightComponent = useComponent(props.entity, HemisphereLightComponent).value

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.hemisphere.name')}
      description={t('editor:properties.hemisphere.description')}
      Icon={HemisphereLightNodeEditor.iconComponent}
    >
      <InputGroup name="Sky Color" label={t('editor:properties.hemisphere.lbl-skyColor')}>
        <ColorInput
          value={lightComponent.skyColor}
          onChange={updateProperty(HemisphereLightComponent, 'skyColor')}
          onRelease={commitProperty(HemisphereLightComponent, 'skyColor')}
        />
      </InputGroup>
      <InputGroup name="Ground Color" label={t('editor:properties.hemisphere.lbl-groundColor')}>
        <ColorInput
          value={lightComponent.groundColor}
          onChange={updateProperty(HemisphereLightComponent, 'groundColor')}
          onRelease={commitProperty(HemisphereLightComponent, 'groundColor')}
        />
      </InputGroup>
      <InputGroup name="Intensity" label={t('editor:properties.hemisphere.lbl-intensity')}>
        <NumericInput
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={lightComponent.intensity}
          onChange={updateProperty(HemisphereLightComponent, 'intensity')}
          onRelease={commitProperty(HemisphereLightComponent, 'intensity')}
          unit="cd"
        />
      </InputGroup>
    </NodeEditor>
  )
}

HemisphereLightNodeEditor.iconComponent = PiSunHorizon

export default HemisphereLightNodeEditor
