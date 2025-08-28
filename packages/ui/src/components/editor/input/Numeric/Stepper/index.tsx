import React from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

import { t } from 'i18next'
import { twMerge } from 'tailwind-merge'
import NumericInput, { NumericInputProp } from '..'
import Tooltip from '../../../../../primitives/tailwind/Tooltip'

export function NumericStepperInput({
  style,
  className,
  decrementTooltip,
  incrementTooltip,
  onChange,
  value,
  mediumStep,
  ...rest
}: {
  style?: React.CSSProperties
  className?: string
  incrementTooltip?: string
  decrementTooltip?: string
  onChange: (val: number) => void
  value: number
  mediumStep: number
} & NumericInputProp) {
  const onIncrement = () => onChange(value + mediumStep)
  const onDecrement = () => onChange(value - mediumStep)

  return (
    <div className={twMerge('flex h-6 w-full flex-1', className)}>
      <Tooltip content={decrementTooltip}>
        <button
          className={twMerge('m-0 flex w-5 justify-center p-0 align-middle', 'rounded-bl rounded-tl')}
          onClick={onDecrement}
        >
          <FaChevronLeft fontSize="small" />
        </button>
      </Tooltip>
      <NumericInput {...rest} onChange={onChange} value={value} mediumStep={mediumStep} />
      <Tooltip content={incrementTooltip}>
        <button
          className={twMerge('m-0 flex w-5 justify-center p-0 align-middle', 'rounded-br rounded-tr')}
          onClick={onIncrement}
        >
          <FaChevronRight fontSize="small" />
        </button>
      </Tooltip>
    </div>
  )
}

NumericStepperInput.defaultProps = {
  incrementTooltip: t('editor:toolbar.grid.info-incrementHeight'),
  decrementTooltip: t('editor:toolbar.grid.info-decrementHeight')
}

export default NumericStepperInput
