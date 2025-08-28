import React from 'react'
import { HiCheck } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'
import { InputProps } from '../Input'
import LoadingView from '../LoadingView'

export interface DropdownItemProps extends Omit<React.HTMLAttributes<HTMLDivElement | HTMLAnchorElement>, 'className'> {
  /**text shown on the left end */
  label: string
  Icon?: ({ className }: { className?: string }) => JSX.Element
  /**text shown on the right end */
  secondaryText?: string
  disabled?: boolean
  selected?: boolean
  className?: string
  href?: string
  height?: InputProps['height']

  /**
   * Whether the item is hovered (or navigated through arrow keys)
   */
  active?: boolean
  /** truncate overflowing label text with an ellipsis */
  truncate?: boolean

  // Show a loading spinner if the item is disabled
  showSpinner?: boolean
}

export function DropdownItem({
  label,
  disabled,
  active,
  Icon,
  selected,
  secondaryText,
  className,
  truncate = true,
  href,
  height = 'l',
  showSpinner = false,
  ...rest
}: DropdownItemProps) {
  const children = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        <span className={truncate ? 'truncate' : ''}>{label}</span>
      </span>
      {secondaryText && !disabled && <span className="ml-auto">{secondaryText}</span>}
      {disabled && showSpinner && <LoadingView spinnerOnly className="w-auto" />}
      {selected && <HiCheck className="ml-auto h-3 w-3 stroke-2" />}
    </>
  )

  const heights = {
    xl: 'h-[3.5rem]',
    l: 'h-[2.5rem]',
    xs: 'h-[2rem]'
  }

  const props = {
    className: twMerge(
      heights[height] || heights['l'],
      'w-full cursor-pointer bg-ui-background px-4 py-2.5 text-sm text-text-tertiary outline-none',
      'flex items-center',
      active ? 'bg-ui-hover-background' : '',
      selected ? 'bg-ui-select-background text-text-primary' : '',
      disabled
        ? 'cursor-not-allowed bg-ui-inactive-background'
        : 'text-ui-inactive-primary-outline hover:bg-ui-hover-background',
      className
    ),
    tabIndex: 0,
    children,
    href,
    ...rest
  }

  return !href ? <div {...props} /> : <a target="_blank" rel="noopener noreferrer" {...props} />
}
