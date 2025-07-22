import React from 'react'
import { useTranslation } from 'react-i18next'

import { PointLightComponent } from '@ir-engine/spatial/src/renderer/components/lights/PointLightComponent'

import { useComponent } from '@ir-engine/ecs'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { AiOutlineBulb } from 'react-icons/ai'
import ColorInput from '../../../../../primitives/tailwind/Color'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import LightShadowProperties from '../shadowProperties'

export const PointLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const lightComponent = useComponent(props.entity, PointLightComponent).value

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.pointLight.name')}
      description={t('editor:properties.pointLight.description')}
      Icon={PointLightNodeEditor.iconComponent}
    >
      <InputGroup name="Color" label={t('editor:properties.pointLight.lbl-color')}>
        <ColorInput
          value={lightComponent.color}
          onChange={updateProperty(PointLightComponent, 'color')}
          onRelease={commitProperty(PointLightComponent, 'color')}
        />
      </InputGroup>
      <InputGroup name="Intensity" label={t('editor:properties.pointLight.lbl-intensity')}>
        <NumericInput
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={lightComponent.intensity}
          onChange={updateProperty(PointLightComponent, 'intensity')}
          onRelease={commitProperty(PointLightComponent, 'intensity')}
          unit="cd"
        />
      </InputGroup>
      <InputGroup name="Range" label={t('editor:properties.pointLight.lbl-range')}>
        <NumericInput
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={lightComponent.range}
          onChange={updateProperty(PointLightComponent, 'range')}
          onRelease={commitProperty(PointLightComponent, 'range')}
          unit="m"
        />
      </InputGroup>
      <InputGroup name="Decay" label={t('editor:properties.pointLight.lbl-decay')}>
        <NumericInput
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={lightComponent.decay}
          onChange={updateProperty(PointLightComponent, 'decay')}
          onRelease={commitProperty(PointLightComponent, 'decay')}
        />
      </InputGroup>
      <LightShadowProperties entity={props.entity} component={PointLightComponent} />
    </NodeEditor>
  )
}

PointLightNodeEditor.iconComponent = AiOutlineBulb

export default PointLightNodeEditor
