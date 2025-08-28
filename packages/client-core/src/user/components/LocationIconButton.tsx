import { AudioEffectPlayer } from '@ir-engine/engine/src/audio/systems/MediaSystem'
import { SVGIconType } from '@ir-engine/ui/src/icons/types'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Tooltip, { TooltipProps } from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import React from 'react'
import { IconType } from 'react-icons'
import { twMerge } from 'tailwind-merge'

interface LocationIconButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  tooltip?: {
    title: string
    position?: TooltipProps['position']
  }
  icon: SVGIconType | IconType
  iconProps?: React.SVGProps<SVGSVGElement>
  loadingState?: boolean
}

function LocationIconButton({
  tooltip,
  icon: Icon,
  iconProps,
  className,
  loadingState = false,
  ...props
}: LocationIconButtonProps) {
  const Button = () => {
    const { ref, className, ...restIconProps } = iconProps || {}

    return (
      <button
        className={twMerge(
          'flex h-[50px] w-[50px] select-none items-center justify-center rounded-full bg-white mdh:h-16 mdh:w-16',
          className
        )}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        {...props}
      >
        {(loadingState && <LoadingView className="h-6 w-6" />) || (
          <Icon
            ref={() => ref}
            className={twMerge('h-[20px] w-[20px] text-[#080808] lg:h-[24px] lg:w-[24px]', className)}
            {...restIconProps}
          />
        )}
      </button>
    )
  }

  return tooltip ? (
    <Tooltip content={tooltip.title} position={tooltip.position || 'bottom'}>
      <Button />
    </Tooltip>
  ) : (
    <Button />
  )
}

export default LocationIconButton
