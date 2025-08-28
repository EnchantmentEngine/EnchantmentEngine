import { Q_IDENTITY } from '@ir-engine/spatial/src/common/constants/MathConstants'
import React, { useRef } from 'react'
import { Euler, Quaternion, MathUtils as _Math } from 'three'
import NumericInput from '../Numeric'
import { Vector3Scrubber } from '../Vector3'

const { RAD2DEG, DEG2RAD } = _Math

type EulerInputProps = {
  quaternion: Quaternion
  onChange: (quat: Quaternion) => any
  onRelease?: () => any
  unit?: string
  disabled?: boolean
}

const getBoundedRoundedAngle = (angle: number) => {
  const multiplier = Math.ceil(Math.abs(angle) / 360)
  angle += multiplier * 360
  angle %= 360
  return Math.round(angle * 1000) / 1000
}

const tempEuler = new Euler()

export const EulerInput = ({ disabled, quaternion, onRelease, unit, onChange, ...rest }: EulerInputProps) => {
  const prevAnglesRef = useRef({ x: 0, y: 0, z: 0 })

  tempEuler.setFromQuaternion(quaternion, 'YXZ')

  const rawAngles = {
    x: getBoundedRoundedAngle(tempEuler.x * RAD2DEG),
    y: getBoundedRoundedAngle(tempEuler.y * RAD2DEG),
    z: getBoundedRoundedAngle(tempEuler.z * RAD2DEG)
  }

  const getSmoothedAngles = (newAngles: { x: number; y: number; z: number }) => {
    const smoothed = { ...newAngles }
    const prev = prevAnglesRef.current

    Object.keys(smoothed).forEach((axisKey) => {
      const axis = axisKey as keyof typeof smoothed
      let diff = Math.abs(smoothed[axis] - prev[axis])

      if (diff > 180) {
        diff = 360 - diff
      }

      if (diff > 90) {
        smoothed[axis] = prev[axis]
      }
    })

    prevAnglesRef.current = { ...smoothed }
    return smoothed
  }

  const angle = getSmoothedAngles(rawAngles)

  const onSetEuler = (angleCoordinate: 'x' | 'y' | 'z') => (angleInDegree: number) => {
    const newAngles = { ...angle }
    newAngles[angleCoordinate] = getBoundedRoundedAngle(angleInDegree)

    prevAnglesRef.current[angleCoordinate] = newAngles[angleCoordinate]

    const euler = new Euler(newAngles.x * DEG2RAD, newAngles.y * DEG2RAD, newAngles.z * DEG2RAD, 'YXZ')
    const quaternion = new Quaternion().setFromEuler(euler)
    onChange?.(quaternion)
  }

  return (
    <div className="grid w-full grid-cols-3 gap-x-2">
      <NumericInput
        disabled={disabled}
        value={angle.x}
        onChange={onSetEuler('x')}
        onRelease={onRelease}
        unit={unit}
        prefix={
          <Vector3Scrubber
            {...rest}
            disabled={disabled}
            value={angle.x}
            onChange={onSetEuler('x')}
            onRelease={onRelease}
            axis="x"
          />
        }
      />
      <NumericInput
        disabled={disabled}
        value={angle.y}
        onChange={onSetEuler('y')}
        onRelease={onRelease}
        unit={unit}
        prefix={
          <Vector3Scrubber
            {...rest}
            disabled={disabled}
            value={angle.y}
            onChange={onSetEuler('y')}
            onRelease={onRelease}
            axis="y"
          />
        }
      />
      <NumericInput
        disabled={disabled}
        value={angle.z}
        onChange={onSetEuler('z')}
        onRelease={onRelease}
        unit={unit}
        prefix={
          <Vector3Scrubber
            {...rest}
            disabled={disabled}
            value={angle.z}
            onChange={onSetEuler('z')}
            onRelease={onRelease}
            axis="z"
          />
        }
      />
    </div>
  )
}

EulerInput.defaultProps = {
  quaternion: Q_IDENTITY,
  disabled: false
}

export default EulerInput
