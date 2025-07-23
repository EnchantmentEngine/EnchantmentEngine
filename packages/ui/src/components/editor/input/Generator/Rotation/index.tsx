import {
  AxisAngleGeneratorJSON,
  EulerGeneratorJSON,
  RotationGeneratorJSON,
  RotationGeneratorJSONDefaults,
  ValueGeneratorJSON
} from '@ir-engine/engine/src/scene/types/ParticleSystemTypes'
import { State } from '@ir-engine/hyperflux'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Vector3 } from 'three'
import InputGroup from '../../Group'
import SelectInput from '../../Select'
import Vector3Input from '../../Vector3'
import ValueGenerator from '../Value'

type RotationGeneratorProps = Readonly<{
  path: string
  scope: State<RotationGeneratorJSON>
  value: RotationGeneratorJSON
  onChange: (path: string) => (value: any) => void
}>
export default function RotationGenerator({ path, scope, value, onChange }: RotationGeneratorProps) {
  const { t } = useTranslation()

  const onChangeVec3 = useCallback((path: string) => {
    const thisOnChange = onChange(path)
    return (vec3: Vector3) => {
      thisOnChange([...vec3.toArray()])
    }
  }, [])

  const AxisAngleGeneratorInput = useCallback(() => {
    const axisAngleScope = scope as State<AxisAngleGeneratorJSON>
    const axisAngle = axisAngleScope.value

    if (!axisAngle.axis || !axisAngle.angle) {
      const defaultAxisAngle = RotationGeneratorJSONDefaults['AxisAngle'] as AxisAngleGeneratorJSON
      axisAngleScope.set(defaultAxisAngle)

      return
    }

    return (
      <>
        <InputGroup name="Axis" label={t('editor:properties.particle-system.rotation.axis')}>
          <Vector3Input value={new Vector3(...axisAngle.axis)} onChange={onChangeVec3(path + '.axis')} />
        </InputGroup>
        <InputGroup name="Angle" label={t('editor:properties.particle-system.rotation.angle')}>
          <ValueGenerator
            path={path + '.angle'}
            scope={axisAngleScope.angle}
            value={axisAngle.angle as ValueGeneratorJSON}
            onChange={onChange}
          />
        </InputGroup>
      </>
    )
  }, [])

  const EulerGeneratorInput = useCallback(() => {
    const eulerScope = scope as State<EulerGeneratorJSON>
    const euler = eulerScope.value

    if (!euler.angleX || !euler.angleY || !euler.angleZ) {
      const defaultEuler = RotationGeneratorJSONDefaults['Euler'] as EulerGeneratorJSON
      eulerScope.set(defaultEuler)

      return
    }

    return (
      <>
        <InputGroup
          name="Angle X"
          label={t('editor:properties.particle-system.rotation.anglePosition', { position: 'X' })}
        >
          <ValueGenerator
            path={path + '.angleX'}
            scope={eulerScope.angleX}
            value={euler.angleX as ValueGeneratorJSON}
            onChange={onChange}
          />
        </InputGroup>
        <InputGroup
          name="Angle Y"
          label={t('editor:properties.particle-system.rotation.anglePosition', { position: 'Y' })}
        >
          <ValueGenerator
            path={path + '.angleY'}
            scope={eulerScope.angleY}
            value={euler.angleY as ValueGeneratorJSON}
            onChange={onChange}
          />
        </InputGroup>
        <InputGroup
          name="Angle Z"
          label={t('editor:properties.particle-system.rotation.anglePosition', { position: 'Z' })}
        >
          <ValueGenerator
            path={path + '.angleZ'}
            scope={eulerScope.angleZ}
            value={euler.angleZ as ValueGeneratorJSON}
            onChange={onChange}
          />
        </InputGroup>
      </>
    )
  }, [scope, path, onChange, t])

  const RandomQuatGeneratorInput = useCallback(() => {
    return <></>
  }, [])

  const onChangeRotationType = useCallback(() => {
    const thisOnChange = onChange(path)
    return (type: typeof value.type) => {
      const defaultValue = RotationGeneratorJSONDefaults[type]
      scope.set(defaultValue)

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
