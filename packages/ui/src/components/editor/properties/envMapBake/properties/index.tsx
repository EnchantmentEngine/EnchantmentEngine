import React from 'react'

import { ComponentType } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { EnvMapBakeComponent } from '@ir-engine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvMapBakeRefreshTypes } from '@ir-engine/engine/src/scene/types/EnvMapBakeRefreshTypes'
import { EnvMapBakeTypes } from '@ir-engine/engine/src/scene/types/EnvMapBakeTypes'

import { commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { Checkbox } from '@ir-engine/ui'
import { BakePropertyTypes } from '..'
import InputGroup from '../../../input/Group'
import SelectInput from '../../../input/Select'
import Vector3Input from '../../../input/Vector3'

type EnvMapBakePropertyEditorProps = {
  bakeComponent: ComponentType<typeof EnvMapBakeComponent>
  element: any
  entity: Entity
}

const envMapBakeSelectTypes = [
  {
    label: 'Runtime',
    value: EnvMapBakeTypes.Realtime
  },
  {
    label: 'Baked',
    value: EnvMapBakeTypes.Baked
  }
]

const envMapBakeRefreshSelectTypes = [
  {
    label: 'On Awake',
    value: EnvMapBakeRefreshTypes.OnAwake
  }
  // {
  //     label:"Every Frame",
  //     value: EnvMapBakeRefreshTypes.EveryFrame,
  // }
]

const bakeResolutionTypes = [
  {
    label: '128',
    value: 128
  },
  {
    label: '256',
    value: 256
  },
  {
    label: '512',
    value: 512
  },
  {
    label: '1024',
    value: 1024
  },
  {
    label: '2048',
    value: 2048
  }
]

export const EnvMapBakeProperties = (props: EnvMapBakePropertyEditorProps) => {
  const getPropertyValue = (option) => props.bakeComponent[option]

  let renderVal = <></>
  const label = props.element.label
  const propertyName = props.element.propertyName

  switch (props.element.type) {
    case BakePropertyTypes.Boolean:
      renderVal = (
        <Checkbox
          checked={getPropertyValue(propertyName)}
          onChange={commitProperty(EnvMapBakeComponent, propertyName)}
        />
      )
      break
    case BakePropertyTypes.BakeType:
      renderVal = (
        <SelectInput
          key={props.entity}
          options={envMapBakeSelectTypes}
          onChange={commitProperty(EnvMapBakeComponent, propertyName)}
          value={getPropertyValue(propertyName)}
        />
      )
      break

    case BakePropertyTypes.RefreshMode:
      renderVal = (
        <SelectInput
          key={props.entity}
          options={envMapBakeRefreshSelectTypes}
          onChange={commitProperty(EnvMapBakeComponent, propertyName)}
          value={getPropertyValue(propertyName)}
        />
      )
      break

    case BakePropertyTypes.Resolution:
      renderVal = (
        <SelectInput
          key={props.entity}
          options={bakeResolutionTypes}
          onChange={commitProperty(EnvMapBakeComponent, propertyName)}
          value={getPropertyValue(propertyName)}
        />
      )
      break

    case BakePropertyTypes.Vector:
      renderVal = (
        <Vector3Input
          onChange={updateProperty(EnvMapBakeComponent, propertyName)}
          onRelease={commitProperty(EnvMapBakeComponent, propertyName)}
          value={getPropertyValue(propertyName)}
        />
      )
      break

    default:
      renderVal = <div>Undefined value Type</div>
      break
  }

  return (
    <InputGroup name={label} label={label}>
      {renderVal}
    </InputGroup>
  )
}

export default EnvMapBakeProperties
