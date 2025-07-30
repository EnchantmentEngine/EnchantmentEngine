import {
  AxisAngleGeneratorJSON,
  EulerGeneratorJSON,
  RotationGeneratorJSON,
  RotationGeneratorJSONDefaults,
  ValueGeneratorJSON
} from '@ir-engine/engine/src/scene/types/ParticleSystemTypes'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Vector3 } from 'three'
import InputGroup from '../../Group'
import SelectInput from '../../Select'
import Vector3Input from '../../Vector3'
import ValueGenerator from '../Value'

type RotationGeneratorProps = Readonly<{
  path: string
  value: RotationGeneratorJSON
  onChange: (path: string) => (value: any) => void
}>
export default function RotationGenerator({ path, value, onChange }: RotationGeneratorProps) {
  const { t } = useTranslation()

  const onChangeVec3 = useCallback((path: string) => {
    const thisOnChange = onChange(path)
    return (vec3: Vector3) => {
      thisOnChange([...vec3.toArray()])
    }
  }, [])

  const AxisAngleGeneratorInput = useCallback(() => {
    const axisAngle = value as AxisAngleGeneratorJSON

    if (!axisAngle.axis || !axisAngle.angle) {
      onChange(path)({ axis: new Vector3(0, 1, 0), angle: { type: 'ConstantValue', value: 0 } })
      return
    }

    return (
      <>
        <InputGroup name="Axis" label={t('editor:properties.particle-system.rotation.axis')}>
          <Vector3Input value={new Vector3(...axisAngle.axis)} onChange={onChangeVec3(path + '.axis')} />
        </InputGroup>
        <InputGroup name="Angle" label={t('editor:properties.particle-system.rotation.angle')}>
          <ValueGenerator path={path + '.angle'} value={axisAngle.angle} onChange={onChange} />
        </InputGroup>
      </>
    )
  }, [])

  const EulerGeneratorInput = useCallback(() => {
    const euler = value as EulerGeneratorJSON

    if (!euler.angleX || !euler.angleY || !euler.angleZ) {
      const defaultEuler = RotationGeneratorJSONDefaults['Euler'] as EulerGeneratorJSON
      onChange(path)(defaultEuler)
      return
    }

    return (
      <>
        <InputGroup
          name="Angle X"
          label={t('editor:properties.particle-system.rotation.anglePosition', { position: 'X' })}
        >
          <ValueGenerator path={path + '.angleX'} value={euler.angleX as ValueGeneratorJSON} onChange={onChange} />
        </InputGroup>
        <InputGroup
          name="Angle Y"
          label={t('editor:properties.particle-system.rotation.anglePosition', { position: 'Y' })}
        >
          <ValueGenerator path={path + '.angleY'} value={euler.angleY as ValueGeneratorJSON} onChange={onChange} />
        </InputGroup>
        <InputGroup
          name="Angle Z"
          label={t('editor:properties.particle-system.rotation.anglePosition', { position: 'Z' })}
        >
          <ValueGenerator path={path + '.angleZ'} value={euler.angleZ as ValueGeneratorJSON} onChange={onChange} />
        </InputGroup>
      </>
    )
  }, [value, path, onChange, t])

  const RandomQuatGeneratorInput = useCallback(() => {
    return <></>
  }, [])

  const onChangeRotationType = useCallback(() => {
    const thisOnChange = onChange(path)
    return (type: typeof value.type) => {
      const defaultValue = RotationGeneratorJSONDefaults[type]
      onChange(path)(defaultValue)
      thisOnChange(type)
    }
  }, [])

  const rotationInputs = {
    AxisAngle: AxisAngleGeneratorInput,
    Euler: EulerGeneratorInput,
    RandomQuat: RandomQuatGeneratorInput
  }

  const rotationValue = useMemo(() => {
    if (value.type) {
      return value.type
    }

    return value
  }, [value])

  return (
    <>
      <InputGroup name="Type" label="Type">
        <SelectInput
          value={rotationValue}
          options={[
            { label: t('editor:properties.particle-system.rotation.axisAngle'), value: 'AxisAngle' },
            { label: t('editor:properties.particle-system.rotation.euler'), value: 'Euler' },
            { label: t('editor:properties.particle-system.rotation.randomQuaternion'), value: 'RandomQuat' }
          ]}
          onChange={onChangeRotationType()}
        />
      </InputGroup>
      {rotationInputs[rotationValue]()}
    </>
  )
}
