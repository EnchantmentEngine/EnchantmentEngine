import React from 'react'

import { camelCaseToSpacedString } from '@ir-engine/common/src/utils/camelCaseToSpacedString'
import capitalizeFirstLetter from '@ir-engine/common/src/utils/capitalizeFirstLetter'
import { generateDefaults } from '@ir-engine/spatial/src/renderer/materials/constants/DefaultArgs'
import { Checkbox } from '@ir-engine/ui'
import ColorInput from '../../../../primitives/tailwind/Color'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import StringInput from '../../input/String'
import TexturePreviewInput from '../../input/Texture'

/** @todo change this to use component schemas instead */
export default function ParameterInput({
  path,
  values,
  onChange,
  defaults,
  thumbnails,
  ...rest
}: {
  path: string
  values: object
  defaults?: object
  thumbnails?: Record<string, string>
  onChange: (k: string) => (v) => void
  onModify?: () => void
}) {
  const { onModify } = rest
  function setArgsProp(k) {
    const thisOnChange = onChange(k)
    return (value) => {
      //values[k] = value
      thisOnChange(value)
    }
  }

  function setArgsArrayProp(k, idx) {
    const thisOnChange = onChange(k)
    return (value) => {
      const nuVals = values[k].map((oldVal, oldIdx) => (idx === oldIdx ? value : oldVal))
      thisOnChange(nuVals)
    }
  }

  function setArgsObjectProp(k) {
    const thisOnChange = onChange(k)
    const oldVal = values[k]
    return (field) => {
      return (value) => {
        const nuVal = Object.fromEntries([
          ...Object.entries(oldVal).filter(([_field, _value]) => _field !== field),
          [field, value]
        ])
        thisOnChange(nuVal)
      }
    }
  }

  const _defaults = defaults ?? generateDefaults(values)
  /*
0: "boolean"
1: "string"
2: "integer"
3: "float"
4: "vec2"
5: "vec3"
6: "vec4"
7: "color"
8: "euler"
9: "quat"
10: "mat3"
11: "mat4"
12: "object"
13: "list"
14: "entity"*/
  const valuesWithDefaults = {
    ...Object.fromEntries(Object.entries(_defaults).map(([k, v]) => [k, v.default])),
    ...values
  }

  return (
    <>
      {Object.entries(_defaults).map(([k, parms]: [string, any]) => {
        const compKey = `${path}-${k}`
        return (
          <InputGroup key={compKey} name={k} label={camelCaseToSpacedString(capitalizeFirstLetter(k))}>
            {(() => {
              switch (parms.type) {
                case 'boolean':
                  return <Checkbox checked={valuesWithDefaults[k]} onChange={setArgsProp(k)} />
                case 'entity':
                case 'integer':
                case 'float':
                  return <NumericInput value={valuesWithDefaults[k]} onChange={setArgsProp(k)} />
                case 'string':
                  return <StringInput value={valuesWithDefaults[k]} onChange={setArgsProp(k)} />
                case 'color':
                  return <ColorInput value={valuesWithDefaults[k]} onChange={setArgsProp(k)} />
                case 'texture':
                  return (
                    <TexturePreviewInput
                      preview={thumbnails?.[k]}
                      value={valuesWithDefaults[k]}
                      onRelease={setArgsProp(k + '.map')}
                      onModify={{
                        channel: setArgsProp(k + '.channel'),
                        offset: setArgsProp(k + '.offset'),
                        repeat: setArgsProp(k + '.repeat')
                      }}
                    />
                  )
                case 'vec2':
                case 'vec3':
                case 'vec4':
                  return (
                    typeof valuesWithDefaults[k]?.map === 'function' &&
                    (valuesWithDefaults[k] as number[]).map((arrayVal, idx) => (
                      <NumericInput key={`${compKey}-${idx}`} value={arrayVal} onChange={setArgsArrayProp(k, idx)} />
                    ))
                  )
                case 'select':
                  return (
                    <SelectInput
                      value={valuesWithDefaults[k]}
                      options={JSON.parse(JSON.stringify(parms.options))}
                      onChange={setArgsProp(k)}
                    />
                  )
                case 'object':
                  return (
                    <ParameterInput
                      path={compKey}
                      values={valuesWithDefaults[k]}
                      onChange={setArgsObjectProp(k)}
                      defaults={parms.default}
                    />
                  )
                default:
                  return <></>
              }
            })()}
          </InputGroup>
        )
      })}
    </>
  )
}
