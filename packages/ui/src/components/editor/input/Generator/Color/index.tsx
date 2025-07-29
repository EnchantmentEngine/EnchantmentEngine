import React, { useCallback } from 'react'

import {
  ColorGeneratorJSON,
  ColorGradientJSON,
  ColorRangeJSON,
  ConstantColorJSON,
  RandomColorJSON
} from '@ir-engine/engine/src/scene/types/ParticleSystemTypes'
import { t as translate } from 'i18next'
import { useTranslation } from 'react-i18next'
import Button from '../../../../../primitives/tailwind/Button'
import { OptionType } from '../../../../../primitives/tailwind/Select'
import InputGroup from '../../Group'
import SelectInput from '../../Select'
import { ColorJSONInput } from './ColorJSONInput'
import { GradientInputItem } from './GradientInputItem'

const colorOptions: OptionType[] = [
  { label: translate('editor:properties.particle-system.startColor.constant'), value: 'ConstantColor' },
  { label: translate('editor:properties.particle-system.startColor.range'), value: 'ColorRange' },
  { label: translate('editor:properties.particle-system.startColor.random'), value: 'RandomColor' },
  { label: translate('editor:properties.particle-system.startColor.gradient'), value: 'Gradient' }
]

type ColorGeneratorProps = Readonly<{
  path: string
  value: ColorGeneratorJSON
  onChange: (path: string) => (value: any) => void
}>
export default function ColorGenerator({ path, value, onChange }: ColorGeneratorProps) {
  const { t } = useTranslation()

  const onChangeType = useCallback(() => {
    const thisOnChange = onChange(path + '.type')
    return (type: typeof value.type) => {
      thisOnChange(type)
    }
  }, [])

  const ConstantColorInput = useCallback(() => {
    const constant = value as ConstantColorJSON

    return <ColorJSONInput value={constant.color} onChange={onChange(path + '.color')} />
  }, [value])

  const ColorRangeInput = useCallback(() => {
    const range = value as ColorRangeJSON

    return (
      <>
        <InputGroup name="A" label="A" containerClassName="pl-0">
          <ColorJSONInput value={range.a} onChange={onChange(path + '.a')} />
        </InputGroup>
        <InputGroup name="B" label="B" containerClassName="pl-0">
          <ColorJSONInput value={range.b} onChange={onChange(path + '.b')} />
        </InputGroup>
      </>
    )
  }, [value])

  const RandomColorInput = useCallback(() => {
    const random = value as RandomColorJSON

    return (
      <>
        <InputGroup name="A" label="A" containerClassName="pl-0">
          <ColorJSONInput value={random.a} onChange={onChange(path + '.a')} />
        </InputGroup>
        <InputGroup name="B" label="B" containerClassName="pl-0">
          <ColorJSONInput value={random.b} onChange={onChange(path + '.b')} />
        </InputGroup>
      </>
    )
  }, [value])

  const GradientInput = useCallback(() => {
    const gradient = value as ColorGradientJSON

    const handleAddGradient = () => {
      gradient.functions = [
        ...JSON.parse(JSON.stringify(gradient.functions)),
        {
          start: 0,
          function: {
            type: 'ColorRange',
            a: { r: 1, g: 1, b: 1, a: 1 },
            b: { r: 1, g: 1, b: 1, a: 1 }
          }
        }
      ]
    }

    return (
      <div>
        <Button onClick={handleAddGradient}>+</Button>

        {gradient.functions.map((item, index) => (
          <GradientInputItem key={index} path={path} index={index} item={item} value={value} onChange={onChange} />
        ))}
      </div>
    )
  }, [value])

  const colorInputs = {
    ConstantColor: ConstantColorInput,
    ColorRange: ColorRangeInput,
    RandomColor: RandomColorInput,
    Gradient: GradientInput
  }

  return (
    <div>
      <InputGroup name="type" label={t('editor:properties.particle-system.startColor.type')} containerClassName="pl-0">
        <SelectInput value={value.type} options={colorOptions} onChange={onChangeType()} />
      </InputGroup>
      {colorInputs[value.type]()}
    </div>
  )
}
