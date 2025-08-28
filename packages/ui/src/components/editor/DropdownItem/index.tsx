import { ChevronDownSm, ChevronRightSm, Maximize02Sm } from '@ir-engine/ui/src/icons'
import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface EditorDropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  disabled?: boolean
  ItemIcon?: ({ className }: { className: string }) => JSX.Element
  onClick?: () => void
  label: string
  RightIcon1?: ({ className, onClick }: { className: string; onClick?: () => void }) => JSX.Element
  onRightIcon1Click?: () => void
  RightIcon2?: ({ className, onClick }: { className: string; onClick?: () => void }) => JSX.Element
  onRightIcon2Click?: () => void
  collapsed?: boolean
  className?: string
}

export default function EditorDropdownItem({
  selected,
  disabled,
  ItemIcon,
  label,
  onRightIcon1Click,
  RightIcon1,
  onRightIcon2Click,
  RightIcon2,
  onClick,
  className,
  collapsed,
  ...props
}: EditorDropdownItemProps) {
  const iconClassname = twMerge(
    'h-4 w-4 text-text-secondary',
    disabled ? 'text-text-inactive' : 'group-hover/editor-dropdownitem:text-text-primary'
  )

  return (
    <div
      className={twMerge(
        'flex w-full items-center gap-x-2',
        'cursor-pointer rounded py-1',
        'group/editor-dropdownitem',
        disabled
          ? 'cursor-not-allowed bg-ui-inactive-background text-text-inactive'
          : 'bg-ui-background text-text-secondary hover:text-text-primary',
        selected ? 'bg-ui-select-background' : '',
        className
      )}
      data-testid={label}
      onClick={() => !disabled && onClick?.()}
      tabIndex={0}
      onKeyUp={(event) => {
        if (!disabled && ['Enter', ' '].includes(event.key)) onClick?.()
      }}
      {...props}
    >
      {collapsed ? (
        <ChevronRightSm className={iconClassname} data-testid="expand-item" />
      ) : (
        <ChevronDownSm className={iconClassname} data-testid="collapse-item" />
      )}
      {ItemIcon ? <ItemIcon className={iconClassname} /> : <Maximize02Sm className={iconClassname} />}
      <span className="flex-1 text-sm" data-testid="item-name">
        {label}
      </span>
      {RightIcon1 && <RightIcon1 className={iconClassname} onClick={onRightIcon1Click} />}
      {RightIcon2 && <RightIcon2 className={iconClassname} onClick={onRightIcon2Click} />}
    </div>
  )
}
