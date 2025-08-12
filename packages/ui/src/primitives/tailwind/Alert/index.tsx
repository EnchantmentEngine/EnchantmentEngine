import { AlertCircleLg, CheckCircleLg, InfoCircleLg, Warning } from '@ir-engine/ui/src/icons'
import { isEmpty } from 'lodash-es'
import React, { forwardRef, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export const AlertVariantEnum = {
  SUCCESS: 'success',
  DANGER: 'danger',
  INFO: 'info',
  WARNING: 'warning'
} as const

export type AlertVariantEnum = (typeof AlertVariantEnum)[keyof typeof AlertVariantEnum]

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message: string | React.ReactNode
  variant: AlertVariantEnum
}

type AlertVariant = {
  containerClass: string
  iconClass: string
  icon: ReactNode
}

const variantMap: Record<string, AlertVariant> = {
  success: {
    containerClass: 'bg-ui-background',
    iconClass: 'text-teal-500',
    icon: <CheckCircleLg />
  },
  danger: {
    containerClass: 'bg-ui-background',
    iconClass: 'text-red-500',
    icon: <AlertCircleLg />
  },
  info: {
    containerClass: 'bg-ui-background',
    iconClass: 'text-blue-500',
    icon: <InfoCircleLg />
  },
  warning: {
    containerClass: 'bg-ui-background',
    iconClass: 'text-text-warning',
    icon: <Warning />
  }
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(({ title, message, variant, className, children }, ref) => {
  const { containerClass, iconClass, icon } = variantMap[variant]
  const twContainerClass = twMerge('rounded-lg px-4 py-3 shadow-md', containerClass, className)
  const twIconClass = twMerge('mr-4 py-1 text-2xl', iconClass)

  return (
    <div className={twContainerClass} role="alert" ref={ref}>
      <div className="flex items-center gap-x-4">
        <div className={twIconClass}>{icon}</div>
        <div>
          {title && <p className="font-medium">{title}</p>}
          {isEmpty(children) && <p className="text-sm text-text-tertiary">{message}</p>}
          {!isEmpty(children) && <>{children}</>}
        </div>
      </div>
    </div>
  )
})

export default Alert
