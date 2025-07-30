import { CheckLg, MinusLg } from '@ir-engine/ui/src/icons'
import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface CheckboxProps extends Omit<React.HTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean
  disabled?: boolean
  indeterminate?: boolean
  label?: string
  description?: string
  onChange: (checked: boolean) => void
  /**@default md */
  variantSize?: 'md' | 'lg'
  /**position where `label` and `description` will be placed
   * @default right  */
  variantTextPlacement?: 'left' | 'right'
}

const variantSizes = {
  spacings: {
    md: 'gap-x-2',
    lg: 'gap-x-4'
  },
  checkboxSizes: {
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  },
  iconSizes: {
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5'
  },
  textSizes: {
    md: 'text-sm',
    lg: 'text-base'
  },
  textLineHeight: {
    md: 'leading-5',
    lg: 'leading-6'
  },
  maxDescriptionWidth: {
    md: 'max-w-[220px]',
    lg: 'max-w-[252px]'
  }
}

const Checkbox = (
  {
    checked,
    disabled,
    indeterminate,
    label,
    description,
    onChange,
    variantSize = 'md',
    variantTextPlacement = 'right',
    ...props
  }: CheckboxProps,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const handleChange = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation()
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <div
      className={twMerge(
        'relative flex cursor-pointer items-center',
        'group/checkbox outline-none',
        variantSizes.spacings[variantSize],
        variantTextPlacement === 'left' && 'flex-row-reverse',
        description && 'items-start'
      )}
      onKeyDown={(e) => {
        if (['Enter', ' '].includes(e.key)) handleChange(e)
      }}
      tabIndex={0}
      {...props}
    >
      <div
        className={twMerge(
          'relative shrink-0',
          'grid place-items-center rounded',
          variantSizes.checkboxSizes[variantSize],
          'border border-ui-outline bg-ui-background outline-none',
          (checked || indeterminate) && 'border-ui-select-primary bg-ui-select-background',
          disabled
            ? 'cursor-not-allowed border-ui-inactive-outline bg-ui-inactive-background'
            : 'group-hover/checkbox:border-ui-hover-primary group-hover/checkbox:bg-ui-hover-background'
        )}
        onClick={handleChange}
        ref={ref}
      >
        <CheckLg
          onClick={handleChange}
          className={twMerge(
            'absolute transition-[transform,color] duration-200 ease-in-out',
            'text-ui-primary focus:text-ui-select-primary',
            variantSizes.iconSizes[variantSize],
            disabled ? 'cursor-not-allowed text-ui-inactive-primary' : 'group-hover/checkbox:text-ui-hover-primary',
            checked ? 'scale-100' : 'scale-0'
          )}
        />

        <MinusLg
          onClick={handleChange}
          className={twMerge(
            'absolute transition-transform duration-200 ease-in-out',
            'text-ui-primary focus:text-ui-select-primary',
            variantSizes.iconSizes[variantSize],
            disabled ? 'cursor-not-allowed text-ui-inactive-primary' : 'group-hover/checkbox:text-ui-hover-primary',
            indeterminate ? 'scale-100' : 'scale-0'
          )}
        />
      </div>

      {label && (
        <div
          className={twMerge(
            variantSizes.textSizes[variantSize],
            'cursor-pointer text-text-secondary focus:text-text-primary',
            variantTextPlacement === 'left' && 'text-right',
            disabled ? 'cursor-not-allowed text-text-inactive' : 'group-hover/checkbox:text-text-primary',
            description && 'grid gap-y-1',
            variantSizes.textLineHeight[variantSize]
          )}
          onClick={handleChange}
        >
          <p>{label}</p>
          <p className={twMerge('block text-wrap', variantSizes.maxDescriptionWidth[variantSize])}>{description}</p>
        </div>
      )}
    </div>
  )
}
export default React.forwardRef(Checkbox)
