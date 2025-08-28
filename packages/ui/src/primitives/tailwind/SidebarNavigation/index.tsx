import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface SidebarNavigationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  labels: string[] | React.ReactNode[]
  displayMode?: 'justify-between' | 'justify-start'
  currentTabIndex: number
  onChange: (index: number) => void
}

const SidebarNavigation = ({
  labels,
  displayMode = 'justify-start',
  currentTabIndex,
  onChange,
  ...props
}: SidebarNavigationProps): JSX.Element => {
  return (
    <div
      className={twMerge(
        'flex items-center gap-x-9',
        displayMode === 'justify-between' ? 'justify-between' : 'justify-start'
      )}
      {...props}
    >
      {labels.map((label: string | React.ReactNode, index: number) => (
        <button
          key={index}
          className={twMerge(
            'flex items-center justify-start gap-x-1 border-text-secondary pb-4 font-medium text-text-secondary hover:border-b-2',
            index === currentTabIndex ? 'border-b-2 border-ui-select-primary text-ui-select-primary' : ''
          )}
          data-testid="sidebar-navigation-button"
          onClick={() => onChange(index)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default SidebarNavigation
