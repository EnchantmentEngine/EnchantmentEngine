import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { FogSettingsComponent, FogType } from '@ir-engine/spatial/src/renderer/components/FogSettingsComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'three'

import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { GiFog } from 'react-icons/gi'
import ColorInput from '../../../../primitives/tailwind/Color'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'

const FogTypeOptions = [
  { label: 'Disabled', value: FogType.Disabled },
  { label: 'Linear', value: FogType.Linear },
  { label: 'Exponential', value: FogType.Exponential },
  { label: 'Brownian Motion', value: FogType.Brownian },
  { label: 'Height', value: FogType.Height }
]

export const FogSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const fogState = useComponent(props.entity, FogSettingsComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.fog.name')}
      description={t('editor:properties.fog.description')}
      Icon={FogSettingsEditor.iconComponent}
    >
      <InputGroup name="Fog Type" label={t('editor:properties.fog.lbl-fogType')}>
        <SelectInput
          options={FogTypeOptions}
          value={fogState.type}
          onChange={commitProperty(FogSettingsComponent, 'type')}
        />
      </InputGroup>
      {fogState.type !== FogType.Disabled && (
        <>
          <InputGroup name="Fog Color" label={t('editor:properties.fog.lbl-fogColor')}>
            <ColorInput
              value={new Color(fogState.color)}
              onChange={(val) => updateProperty(FogSettingsComponent, 'color')('#' + val.getHexString())}
              onRelease={(val) => commitProperty(FogSettingsComponent, 'color')('#' + val.getHexString())}
            />
          </InputGroup>
          {fogState.type === FogType.Linear ? (
            <>
              <InputGroup name="Fog Near Distance" label={t('editor:properties.fog.lbl-forNearDistance')}>
                <NumericInput
                  smallStep={0.1}
                  mediumStep={1}
                  largeStep={10}
                  min={0}
                  value={fogState.near}
                  onChange={updateProperty(FogSettingsComponent, 'near')}
                  onRelease={commitProperty(FogSettingsComponent, 'near')}
                />
              </InputGroup>
              <InputGroup name="Fog Far Distance" label={t('editor:properties.fog.lbl-fogFarDistance')}>
                <NumericInput
                  smallStep={1}
                  mediumStep={100}
                  largeStep={1000}
                  min={0}
                  value={fogState.far}
                  onChange={updateProperty(FogSettingsComponent, 'far')}
                  onRelease={commitProperty(FogSettingsComponent, 'far')}
                />
              </InputGroup>
            </>
          ) : (
            <>
              <InputGroup name="Fog Density" label={t('editor:properties.fog.lbl-fogDensity')}>
                <NumericInput
                  smallStep={0.01}
                  mediumStep={0.1}
                  largeStep={0.25}
                  min={0}
                  value={fogState.density}
                  onChange={updateProperty(FogSettingsComponent, 'density')}
                  onRelease={commitProperty(FogSettingsComponent, 'density')}
                />
              </InputGroup>
              {fogState.type !== FogType.Exponential && (
                <InputGroup name="Fog Height" label={t('editor:properties.fog.lbl-fogHeight')}>
                  <NumericInput
                    smallStep={0.01}
                    mediumStep={0.1}
                    largeStep={0.25}
                    min={0}
                    value={fogState.height}
                    onChange={updateProperty(FogSettingsComponent, 'height')}
                    onRelease={commitProperty(FogSettingsComponent, 'height')}
                  />
                </InputGroup>
              )}
              {fogState.type === FogType.Brownian && (
                <InputGroup name="Fog Time Scale" label={t('editor:properties.fog.lbl-fogTimeScale')}>
                  <NumericInput
                    smallStep={0.01}
                    mediumStep={0.1}
                    largeStep={0.25}
                    min={0.001}
                    value={fogState.timeScale}
                    onChange={updateProperty(FogSettingsComponent, 'timeScale')}
                    onRelease={commitProperty(FogSettingsComponent, 'timeScale')}
                  />
                </InputGroup>
              )}
            </>
          )}
        </>
      )}
    </NodeEditor>
  )
}

FogSettingsEditor.iconComponent = GiFog
export default FogSettingsEditor
