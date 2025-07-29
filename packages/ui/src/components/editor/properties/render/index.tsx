import { EntityID, useQuery, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, Layers, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { commitProperty, EditorComponentType, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { RenderSettingsComponent } from '@ir-engine/engine/src/scene/components/RenderSettingsComponent'

import { DirectionalLightComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Checkbox } from '@ir-engine/ui'
import { Slider } from '@ir-engine/ui/editor'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SiRender } from 'react-icons/si'
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  LinearToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  VSMShadowMap
} from 'three'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'

const ToneMappingOptions = [
  {
    label: 'Linear Tone Mapping',
    value: LinearToneMapping
  },
  {
    label: 'Reinhard Tone Mapping',
    value: ReinhardToneMapping
  },
  {
    label: 'Cineon Tone Mapping',
    value: CineonToneMapping
  },
  {
    label: 'ACES Filmic Tone Mapping',
    value: ACESFilmicToneMapping
  }
]

/**
 * ShadowTypeOptions array containing shadow type options.
 *
 * @type {Array}
 */
const ShadowTypeOptions = [
  {
    label: 'Basic Shadow Map',
    value: BasicShadowMap
  },
  {
    label: 'PCF Shadow Map',
    value: PCFShadowMap
  },
  {
    label: 'PCF Soft Shadow Map',
    value: PCFSoftShadowMap
  },
  {
    label: 'VSM Shadow Map',
    value: VSMShadowMap
  }
]

export const RenderSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const { entity } = props
  const rendererSettingsState = useComponent(entity, RenderSettingsComponent)

  const query = useQuery([DirectionalLightComponent], Layers.Authoring)

  const directionalLightOptions = [
    {
      label: 'None',
      value: '' as EntityID
    }
  ].concat(
    query.map((entity) => {
      return {
        label: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent).entityID
      }
    })
  )

  useEffect(() => {
    if (!UUIDComponent.getEntityFromSameSourceByID(entity, rendererSettingsState.primaryLight)) {
      setComponent(entity, RenderSettingsComponent, {
        csm: false,
        primaryLight: '' as EntityID
      })
    }
  }, [rendererSettingsState.primaryLight])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.renderSettings.name')}
      description={t('editor:properties.renderSettings.description')}
      Icon={RenderSettingsEditor.iconComponent}
    >
      <InputGroup
        name="Primary Light"
        label={t('editor:properties.renderSettings.lbl-primaryLight')}
        info={t('editor:properties.renderSettings.info-primaryLight')}
      >
        <SelectInput
          options={directionalLightOptions}
          value={rendererSettingsState.primaryLight}
          onChange={commitProperty(RenderSettingsComponent, 'primaryLight')}
        />
      </InputGroup>
      <InputGroup
        name="Use Cascading Shadow Maps"
        label={t('editor:properties.renderSettings.lbl-csm')}
        info={t('editor:properties.renderSettings.info-csm')}
      >
        <Checkbox checked={rendererSettingsState.csm} onChange={commitProperty(RenderSettingsComponent, 'csm')} />
      </InputGroup>
      {rendererSettingsState.csm === true ? (
        <Slider
          min={1}
          max={5}
          step={1}
          value={rendererSettingsState.cascades}
          onChange={updateProperty(RenderSettingsComponent, 'cascades')}
          onRelease={commitProperty(RenderSettingsComponent, 'cascades')}
          aria-label="Cascades"
          label={t('editor:properties.renderSettings.lbl-csm-cascades')}
          description={t('editor:properties.renderSettings.info-csm-cascades')}
        />
      ) : (
        <></>
      )}
      <InputGroup
        name="Tone Mapping"
        label={t('editor:properties.renderSettings.lbl-toneMapping')}
        info={t('editor:properties.renderSettings.info-toneMapping')}
      >
        <SelectInput
          options={ToneMappingOptions}
          value={rendererSettingsState.toneMapping}
          onChange={commitProperty(RenderSettingsComponent, 'toneMapping')}
        />
      </InputGroup>
      <Slider
        min={0}
        max={10}
        step={0.1}
        value={rendererSettingsState.toneMappingExposure}
        onChange={updateProperty(RenderSettingsComponent, 'toneMappingExposure')}
        onRelease={commitProperty(RenderSettingsComponent, 'toneMappingExposure')}
        aria-label="Tone Mapping Exposure"
        label={t('editor:properties.renderSettings.lbl-toneMappingExposure')}
        description={t('editor:properties.renderSettings.info-toneMappingExposure')}
      />
      <InputGroup
        name="Shadow Map Type"
        label={t('editor:properties.renderSettings.lbl-shadowMapType')}
        info={t('editor:properties.renderSettings.info-shadowMapType')}
      >
        <SelectInput
          options={ShadowTypeOptions}
          value={rendererSettingsState.shadowMapType ?? -1}
          onChange={commitProperty(RenderSettingsComponent, 'shadowMapType')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

RenderSettingsEditor.iconComponent = SiRender

export default RenderSettingsEditor
