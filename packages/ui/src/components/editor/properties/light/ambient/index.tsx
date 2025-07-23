import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@ir-engine/ecs'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { AmbientLightComponent } from '@ir-engine/spatial/src/renderer/components/lights/AmbientLightComponent'
import { HiOutlineSun } from 'react-icons/hi2'
import ColorInput from '../../../../../primitives/tailwind/Color'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'

/**
 * AmbientLightNodeEditor component used to customize the ambient light element on the scene
 * ambient light is basically used to illuminates all the objects present inside the scene.
 */
export const AmbientLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const lightComponent = useComponent(props.entity, AmbientLightComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.ambientLight.name')}
      description={t('editor:properties.ambientLight.description')}
      Icon={AmbientLightNodeEditor.iconComponent}
    >
      <InputGroup name="Color" label={t('editor:properties.ambientLight.lbl-color')}>
        <ColorInput
          className="bg-[#1A1A1A]"
          textClassName="text-white"
          value={lightComponent.color.value}
          onChange={updateProperty(AmbientLightComponent, 'color')}
          onRelease={commitProperty(AmbientLightComponent, 'color')}
        />
      </InputGroup>
      <InputGroup name="Intensity" label={t('editor:properties.ambientLight.lbl-intensity')}>
        <NumericInput
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={lightComponent.intensity.value}
          onChange={updateProperty(AmbientLightComponent, 'intensity')}
          onRelease={commitProperty(AmbientLightComponent, 'intensity')}
          unit="cd"
        />
      </InputGroup>
    </NodeEditor>
  )
}

AmbientLightNodeEditor.iconComponent = HiOutlineSun

export default AmbientLightNodeEditor
