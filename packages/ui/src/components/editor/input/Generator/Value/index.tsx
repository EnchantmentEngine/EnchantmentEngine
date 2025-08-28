import {
  BezierFunctionJSON,
  ConstantValueJSON,
  IntervalValueJSON,
  PiecewiseBezierValueJSON,
  ValueGeneratorJSON
} from '@ir-engine/engine/src/scene/types/ParticleSystemTypes'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../../../primitives/tailwind/Button'
import PaginatedList from '../../../layout/PaginatedList'
import InputGroup from '../../Group'
import NumericInput from '../../Numeric'
import SelectInput from '../../Select'

type ValueGeneratorProps = Readonly<{
  path: string
  value: ValueGeneratorJSON
  onChange: (path: string) => (value: any) => void
}>
export default function ValueGenerator({ path, value, onChange }: ValueGeneratorProps) {
  const { t } = useTranslation()
  const onChangeType = useCallback(() => {
    const thisOnChange = onChange(`${path}.type`)
    return (type: typeof value.type) => {
      thisOnChange(type)
    }
  }, [value, onChange])

  const onAddBezier = useCallback(() => {
    const thisOnChange = onChange(path + '.functions')
    return () => {
      const bezierJson = value as PiecewiseBezierValueJSON
      const newFunctions = [
        ...JSON.parse(JSON.stringify(bezierJson.functions)),
        {
          function: {
            p0: 0,
            p1: 0,
            p2: 1,
            p3: 1
          },
          start: 0
        } as BezierFunctionJSON
      ]
      thisOnChange(newFunctions)
    }
  }, [value, onChange])

  const onRemoveBezier = useCallback(
    (element: BezierFunctionJSON) => {
      const bezier = value as PiecewiseBezierValueJSON
      const thisOnChange = onChange(path + '.functions')
      return () => {
        const nuFunctions = bezier.functions.filter((f) => f !== element)
        thisOnChange(JSON.parse(JSON.stringify(nuFunctions)))
      }
    },
    [value, onChange]
  )

  const ConstantInput = useCallback(() => {
    const constant = value as ConstantValueJSON
    return (
      <>
        <InputGroup
          name="value"
          label={t('editor:properties.particle-system.valueGenerator.value')}
          containerClassName="pl-0"
        >
          <NumericInput value={constant.value} onChange={onChange(path + '.value')} />
        </InputGroup>
      </>
    )
  }, [value, onChange])

  const IntervalInput = useCallback(() => {
    const interval = value as IntervalValueJSON
    return (
      <>
        <InputGroup
          name="min"
          label={t('editor:properties.particle-system.valueGenerator.min')}
          containerClassName="pl-0"
        >
          <NumericInput value={interval.a} onChange={onChange(path + '.a')} />
        </InputGroup>
        <InputGroup
          name="max"
          label={t('editor:properties.particle-system.valueGenerator.max')}
          containerClassName="pl-0"
        >
          <NumericInput value={interval.b} onChange={onChange(path + '.b')} />
        </InputGroup>
      </>
    )
  }, [value, onChange])

  const BezierInput = useCallback(() => {
    const bezier = value as PiecewiseBezierValueJSON
    return (
      <div>
        <Button onClick={onAddBezier()}>{t('editor:properties.particle-system.valueGenerator.addBezier')}</Button>
        {
          <PaginatedList // we still need to make paginated list in tailwind
            list={bezier.functions}
            element={(element: BezierFunctionJSON, index: number) => (
              <div className="m-8 rounded-2xl border border-white p-8">
                <InputGroup
                  label={t('editor:properties.particle-system.valueGenerator.pIndex', { index: 0 })}
                  containerClassName="pl-0"
                >
                  <NumericInput
                    value={element.function.p0}
                    onChange={onChange(path + '.functions.' + index + '.function.p0')}
                  />
                </InputGroup>
                <InputGroup
                  label={t('editor:properties.particle-system.valueGenerator.pIndex', { index: 1 })}
                  containerClassName="pl-0"
                >
                  <NumericInput
                    value={element.function.p1}
                    onChange={onChange(path + '.functions.' + index + '.function.p1')}
                  />
                </InputGroup>
                <InputGroup
                  label={t('editor:properties.particle-system.valueGenerator.pIndex', { index: 2 })}
                  containerClassName="pl-0"
                >
                  <NumericInput
                    value={element.function.p2}
                    onChange={onChange(path + '.functions.' + index + '.function.p2')}
                  />
                </InputGroup>
                <InputGroup
                  label={t('editor:properties.particle-system.valueGenerator.pIndex', { index: 3 })}
                  containerClassName="pl-0"
                >
                  <NumericInput
                    value={element.function.p3}
                    onChange={onChange(path + '.functions.' + index + '.function.p3')}
                  />
                </InputGroup>
                <br />
                <hr />
                <br />
                <InputGroup
                  label={t('editor:properties.particle-system.valueGenerator.start')}
                  containerClassName="pl-0"
                >
                  <NumericInput value={element.start} onChange={onChange(path + '.functions.' + index + '.start')} />
                </InputGroup>
                <br />
                <Button onClick={onRemoveBezier(element)}>
                  {t('editor:properties.particle-system.valueGenerator.remove')}
                </Button>
              </div>
            )}
          />
        }
      </div>
    )
  }, [value, onChange])

  const valueInputs = {
    ConstantValue: ConstantInput,
    IntervalValue: IntervalInput,
    PiecewiseBezier: BezierInput
  }

  return (
    <>
      <InputGroup
        name="type"
        label={t('editor:properties.particle-system.valueGenerator.type')}
        containerClassName="pl-0"
      >
        <SelectInput
          value={value.type}
          options={[
            { label: t('editor:properties.particle-system.valueGenerator.constant'), value: 'ConstantValue' },
            { label: t('editor:properties.particle-system.valueGenerator.interval'), value: 'IntervalValue' },
            { label: t('editor:properties.particle-system.valueGenerator.bezier'), value: 'PiecewiseBezier' }
          ]}
          onChange={onChangeType()}
        />
      </InputGroup>
      {valueInputs[value.type]()}
    </>
  )
}
