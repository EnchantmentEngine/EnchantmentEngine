import { ImmutableObject, useHookstate } from '@ir-engine/hyperflux'
import React from 'react'
import { Vector2 } from 'three'

import { Vector2_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import NumericInput from '../Numeric'
import { Vector3Scrubber } from '../Vector3'

interface Vector2InputProp {
  uniformScaling?: boolean
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  value: ImmutableObject<Vector2>
  hideLabels?: boolean
  onChange: (v: Vector2) => void
  onRelease?: (v: Vector2) => void
  min?: number
  max?: number
  axisLabels?: string[]
  axisClassNames?: string[]
}

/**
 *
 * @param axisLlabels an array for label overrides, index 0 for X, index 1 for Y
 * @param axisClassNames an array for label overrides, index 0 for X axis, index 1 for Y axis
 */
export const Vector2Input = ({
  uniformScaling,
  smallStep,
  mediumStep,
  largeStep,
  value,
  hideLabels,
  onChange,
  onRelease,
  min,
  max,
  axisLabels = ['x', 'y'],
  axisClassNames = [] as string[],
  ...rest
}: Vector2InputProp) => {
  const uniformEnabled = useHookstate(uniformScaling)

  const toVec2 = (field: string, fieldValue: number): Vector2 => {
    if (uniformEnabled.value) {
      return new Vector2(fieldValue, fieldValue)
    } else {
      let clampedValue = fieldValue
      if (min !== undefined) {
        clampedValue = Math.max(min, clampedValue)
      }
      if (max !== undefined) {
        clampedValue = Math.min(max, clampedValue)
      }
      const vec = new Vector2()
      vec.copy(value)
      vec[field] = clampedValue
      return vec
    }
  }

  const onChangeAxis = (axis: string) => (n: number) => {
    onChange(toVec2(axis, n))
  }

  const onReleaseAxis = (axis: string) => (n: number) => {
    onRelease?.(toVec2(axis, n))
  }

  const vx = value.x
  const vy = value.y

  return (
    <div className="flex flex-row justify-end gap-1.5">
      <NumericInput
        {...rest}
        value={vx}
        inputClassName={'text-center '}
        onChange={onChangeAxis('x')}
        onRelease={onReleaseAxis('x')}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber
              {...rest}
              value={vx}
              onChange={onChangeAxis('x')}
              onRelease={onReleaseAxis('x')}
              axis="x"
              axisLabel={axisLabels[0]}
            />
          )
        }
        className={axisClassNames.length > 0 ? axisClassNames[0] : undefined}
      />
      <NumericInput
        {...rest}
        value={vy}
        inputClassName={'text-center'}
        onChange={onChangeAxis('y')}
        onRelease={onReleaseAxis('y')}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber
              {...rest}
              value={vy}
              onChange={onChangeAxis('y')}
              onRelease={onReleaseAxis('y')}
              axis="y"
              axisLabel={axisLabels[1]}
            />
          )
        }
        className={axisClassNames.length > 1 ? axisClassNames[1] : undefined}
      />
    </div>
  )
}

Vector2Input.defaultProps = {
  value: Vector2_Zero,
  hideLabels: false,
  onChange: () => {}
}

export default Vector2Input
