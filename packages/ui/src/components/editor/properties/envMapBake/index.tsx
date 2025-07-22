
import React from 'react'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EnvMapBakeComponent } from '@ir-engine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvMapBakeTypes } from '@ir-engine/engine/src/scene/types/EnvMapBakeTypes'

import DroppableImageInput from '@ir-engine/editor/src/components/assets/DroppableImageInput'
import { commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { uploadBPCEMBakeToServer } from '@ir-engine/editor/src/functions/uploadEnvMapBake'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { Checkbox } from '@ir-engine/ui'
import { useTranslation } from 'react-i18next'
import { IoMapOutline } from 'react-icons/io5'
import Button from '../../../../primitives/tailwind/Button'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import Vector3Input from '../../input/Vector3'
import EnvMapBakeProperties from './properties'

export const BakePropertyTypes = {
  Boolean: 0,
  BakeType: 1,
  RefreshMode: 2,
  Resolution: 3,
  Vector: 4
} as const

export type BakePropertyTypesType = (typeof BakePropertyTypes)[keyof typeof BakePropertyTypes]

const DefaultEnvMapBakeSettings = [
  {
    label: 'Bake Settings',
    options: [
      {
        label: 'Type',
        propertyName: 'bakeType',
        type: BakePropertyTypes.BakeType as BakePropertyTypesType
      },
      {
        label: 'Scale',
        propertyName: 'bakeScale',
        type: BakePropertyTypes.Vector as BakePropertyTypesType
      }
    ]
  },
  {
    label: 'Realtime Settings',
    options: [
      {
        label: 'Refresh Mode',
        propertyName: 'refreshMode',
        type: BakePropertyTypes.RefreshMode as BakePropertyTypesType
      }
    ]
  },

  {
    label: 'Settings',
    options: [
      {
        label: 'Box Projection',
        propertyName: 'boxProjection',
        type: BakePropertyTypes.Boolean as BakePropertyTypesType
      }
    ]
  },
  {
    label: 'Capture Settings',
    options: [
      {
        label: 'Resolution',
        propertyName: 'resolution',
        type: BakePropertyTypes.Resolution as BakePropertyTypesType
      }
    ]
  }
]

const bakeResolutionTypes = [256, 512, 1024, 2048]

const titleLabelStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'left',
  fontWeight: 'bold',
  color: 'var(--textColor)',
  padding: '0 8px 8px',
  ':last-child': {
    marginLeft: 'auto'
  }
}

const envMapBakeNodeEditorStyle = {}

export const EnvMapBakeNodeEditor = (props) => {
  const bakeComponent = useComponent(props.entity, EnvMapBakeComponent)
  const { t } = useTranslation()

  const renderEnvMapBakeProperties = () => {
    const renderedProperty = DefaultEnvMapBakeSettings.map((element, id) => {
      if (element.label == 'Realtime Settings' && bakeComponent.bakeType.value == EnvMapBakeTypes.Realtime) {
        return <div key={id + 'Realtime'} />
      }

      const renderProp = element.label
        ? [
            <div style={titleLabelStyle as React.CSSProperties} key={id + 'title'}>
              {element.label}
            </div>
          ]
        : []

      element.options?.forEach((property, propertyid) => {
        renderProp.push(
          <EnvMapBakeProperties
            key={id + '' + propertyid}
            element={property}
            bakeComponent={bakeComponent.value}
            entity={props.entity}
          />
        )
      })

      renderProp.push(<br key={id + 'break'} />)
      return renderProp
    })

    return renderedProperty
  }

  return (
    <NodeEditor
      style={envMapBakeNodeEditorStyle}
      {...props}
      name={t('editor:properties.envmap.lbl-bake')}
      description="For Adding EnvMap bake in your scene"
      Icon={EnvMapBakeNodeEditor.iconComponent}
    >
      <Button className="my-1 ml-auto px-10" onClick={() => uploadBPCEMBakeToServer(props.entity)}>
        {t(`editor.projects.bake`)}
      </Button>
      <InputGroup name="Position" label="Bake Position Offset" className="w-auto">
        <Vector3Input
          value={bakeComponent.bakePositionOffset.value}
          onChange={updateProperty(EnvMapBakeComponent, 'bakePositionOffset')}
          onRelease={commitProperty(EnvMapBakeComponent, 'bakePositionOffset')}
        />
      </InputGroup>
      <InputGroup name="Scale" label="Box Projection Scale" className="w-auto">
        <Vector3Input
          value={bakeComponent.bakeScale.value}
          onChange={updateProperty(EnvMapBakeComponent, 'bakeScale')}
          onRelease={commitProperty(EnvMapBakeComponent, 'bakeScale')}
        />
      </InputGroup>
      <InputGroup name="Type" label="Bake Type">
        <SelectInput
          options={[
            { label: 'Baked', value: 'Baked' },
            { label: 'Realtime', value: 'Realtime' }
          ]}
          key={props.entity}
          value={bakeComponent.bakeType.value}
          onChange={commitProperty(EnvMapBakeComponent, 'bakeType')}
        />
      </InputGroup>
      <InputGroup name="Bake Resolution" label="Bake Resolution">
        <SelectInput
          options={bakeResolutionTypes.map((resolution) => ({ label: resolution.toString(), value: resolution }))}
          key={props.entity}
          value={bakeComponent.resolution.value}
          onChange={commitProperty(EnvMapBakeComponent, 'resolution')}
        />
      </InputGroup>
      <InputGroup name="EnvMap Origin" label="Environment Map Preview">
        <DroppableImageInput
          src={bakeComponent.envMapOrigin.value}
          onChange={updateProperty(EnvMapBakeComponent, 'envMapOrigin')}
          onBlur={commitProperty(EnvMapBakeComponent, 'envMapOrigin')}
        />
      </InputGroup>
      <Checkbox
        variantTextPlacement="left"
        checked={bakeComponent.boxProjection.value}
        onChange={commitProperty(EnvMapBakeComponent, 'boxProjection')}
        aria-label="Box Projection"
        label="Box Projection"
      />
    </NodeEditor>
  )
}

EnvMapBakeNodeEditor.iconComponent = IoMapOutline
export default EnvMapBakeNodeEditor
