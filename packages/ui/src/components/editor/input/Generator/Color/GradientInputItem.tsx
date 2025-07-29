import React from 'react'

import {
  ColorGeneratorJSON,
  ColorGradientFunctionJSON,
  ColorGradientJSON
} from '@ir-engine/engine/src/scene/types/ParticleSystemTypes'
import { useTranslation } from 'react-i18next'
import Button from '../../../../../primitives/tailwind/Button'
import Text from '../../../../../primitives/tailwind/Text'
import NumericInput from '../../Numeric'
import { ColorJSONInput } from './ColorJSONInput'

type GradientInputItemProps = Readonly<{
  path: string
  index: number
  item: ColorGradientFunctionJSON
  value: ColorGeneratorJSON
  onChange: (path: string) => (value: any) => void
}>

export function GradientInputItem({ path, index, item, value, onChange }: GradientInputItemProps) {
  const { t } = useTranslation()

  const startPath = `${path}.functions.${index}.start`
  const functionAPath = `${path}.functions.${index}.function.a`
  const functionBPath = `${path}.functions.${index}.function.b`

  const handleRemoveGradient = () => {
    const gradient = value as ColorGradientJSON
    const thisOnChange = onChange(path + '.functions')
    const newFunctions = [...gradient.functions]
    newFunctions.splice(index, 1)
    thisOnChange(JSON.parse(JSON.stringify(newFunctions)))
  }

  return (
    <div key={index} className="m-4 overflow-visible rounded-lg border border-white p-6">
      <div className="flex flex-col">
        <div className="flex items-center gap-x-1">
          <Text className="text-text-primary" fontSize="xs">
            {t('editor:properties.particle-system.startColor.start')}
          </Text>
          <NumericInput value={item.start} onChange={onChange(startPath)} min={0} max={0.99} />
        </div>

        <div className="flex items-center gap-x-1">
          <Text className="text-text-primary" fontSize="xs">
            A
          </Text>
          <div className="col-span-1 grid">
            <ColorJSONInput value={item.function.a} onChange={onChange(functionAPath)} />
          </div>
        </div>
        <div className="flex items-center gap-x-1">
          <Text className="text-text-primary" fontSize="xs">
            B
          </Text>
          <div className="col-span-1 grid">
            <ColorJSONInput value={item.function.b} onChange={onChange(functionBPath)} />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Button onClick={handleRemoveGradient}>{t('editor:properties.particle-system.startColor.remove')}</Button>
      </div>
    </div>
  )
}
