import React from 'react'

import { LuInfo } from 'react-icons/lu'
import { MdOutlineHelpOutline } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import Label from '../../../../primitives/tailwind/Label'
import Tooltip from '../../../../primitives/tailwind/Tooltip'

/**
 * Used to provide styles for InputGroupContainer div.
 */
export const InputGroupContainer = ({ disabled = false, children, ...rest }) => (
  <div
    className={
      disabled ? 'pointer-events-none opacity-30' : 'flex min-h-[24px] flex-auto flex-row flex-nowrap px-2 py-1'
    }
    {...rest}
  >
    {children}
  </div>
)

/**
 * Used to provide styles for InputGroupContent div.
 */
export const InputGroupContent = ({ extraClassName = '', children }) => (
  <div
    className={twMerge(
      'ml-4 flex justify-between',
      '[&>label]:block [&>label]:w-[35%] [&>label]:pb-0.5 [&>label]:pt-1 [&>label]:text-neutral-400',
      'text-xs font-normal text-neutral-400',
      '[&>*:first-child]:max-w-[calc(100%_-_2px)]',
      extraClassName
    )}
  >
    {children}
  </div>
)

export const InputGroupVerticalContainer = ({ disabled = false, children }) => (
  <div
    className={twMerge(
      disabled ? 'pointer-events-none opacity-30' : '',
      '[&>label]:block [&>label]:w-[35%] [&>label]:pb-0.5 [&>label]:pt-1 [&>label]:text-[color:var(--textColor)]'
    )}
  >
    {children}
  </div>
)

export const InputGroupVerticalContainerWide = ({ disabled = false, children }) => (
  <div
    className={twMerge(
      disabled ? 'pointer-events-none opacity-30' : '',
      '[&>label]:block [&>label]:w-full [&>label]:pb-0.5 [&>label]:pt-1 [&>label]:text-[color:var(--textColor)]'
    )}
  >
    {children}
  </div>
)

export const InputGroupVerticalContent = ({ children }) => <div className="flex flex-1 flex-col pl-2">{children}</div>
/**
 * Used to provide styles for InputGroupInfoIcon div.
 */
// change later
// .info  text-[color:var(--textColor)] h-4 w-auto ml-[5px]
export const InputGroupInfoIcon = ({ onClick = () => {} }) => (
  <MdOutlineHelpOutline
    className="ml-[5px] flex w-[18px] cursor-pointer self-center text-[color:var(--iconButtonColor)]"
    onClick={onClick}
  />
)

export interface InputGroupProps {
  name?: string
  label: string
  info?: string
  disabled?: boolean
  children: React.ReactNode
  containerClassName?: string
  infoClassName?: string
  className?: string
  dataTestId?: string
}

/**
 * InputGroup used to render the view of component.
 */
export function InputGroup({
  children,
  info,
  label,
  containerClassName,
  infoClassName,
  className,
  disabled,
  dataTestId
}: InputGroupProps) {
  return (
    <div className={twMerge('flex w-full flex-col gap-y-2 py-1.5 pl-8 pr-3.5', containerClassName)}>
      <div className="flex w-full justify-between">
        <Label>{label}</Label>
        {info && (
          <Tooltip content={info}>
            <LuInfo className={twMerge('h-5 w-5 text-text-inactive hover:text-text-primary', infoClassName)} />
          </Tooltip>
        )}
      </div>
      <div className={twMerge('w-full', className)} data-testid={dataTestId || ''}>
        {children}
      </div>
    </div>
  )
}

export default InputGroup
