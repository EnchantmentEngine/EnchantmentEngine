import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Tooltip, { TooltipProps } from '@ir-engine/ui/src/primitives/tailwind/Tooltip'

import { cva, VariantProps } from 'class-variance-authority'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Badge, BadgeProps } from '../Badge'

const containerStyles = cva(
  `
  relative z-10
  inline-flex
  items-center
  justify-center
  text-xl
  text-white

  rounded-full
  -m-2 p-2

  transition-[background]
  transition-transform

  hover:scale-[1.05]
  hover:bg-white/10
  active:bg-white/30
`,
  {
    variants: {
      active: {
        true: `
        scale-[1.05]
        bg-white/30
      `,
        false: ``
      }
    },
    defaultVariants: {
      active: false
    }
  }
)

const loadingContainerStyles = cva(
  `
  absolute
  inset-0
  z-0
`,
  {
    variants: {
      loading: {
        true: `visible`,
        false: `hidden`
      }
    },
    defaultVariants: {
      loading: false
    }
  }
)

const loadingViewStyles = `
  absolute inset-0
  z-10
  p-1
`

export type ContainerVariants = VariantProps<typeof containerStyles>
export type LoadingContainerVariants = VariantProps<typeof loadingContainerStyles>

interface MenuButtonProps extends React.HTMLAttributes<HTMLButtonElement>, ContainerVariants, LoadingContainerVariants {
  tooltip?: {
    title: string
    position?: TooltipProps['position']
  }
  badge?: BadgeProps
}

export const MenuIconButton = ({ active, tooltip, badge, loading, children, className, ...props }: MenuButtonProps) => {
  const { t } = useTranslation()

  const button = (
    <button className={twMerge(containerStyles({ active }), className)} {...props}>
      <div className={loadingContainerStyles({ loading })}>
        <LoadingView className={loadingViewStyles} />
      </div>

      <Badge {...badge} />
      <span className={loading ? `opacity-0` : `opacity-1`}>{children}</span>
    </button>
  )

  const withTooltip = tooltip ? (
    <Tooltip content={t(tooltip.title)} position={tooltip.position || 'bottom'}>
      {button}
    </Tooltip>
  ) : (
    button
  )

  return withTooltip
}
