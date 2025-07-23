import React from 'react'
import { twMerge } from 'tailwind-merge'

import { useHookstate } from '@ir-engine/hyperflux'

const sizes = {
  extraSmall: 'w-6 h-6',
  small: 'w-8 h-8',
  medium: 'w-10 h-10',
  large: 'w-20 h-20',
  extraLarge: 'w-36 h-36',
  fill: ''
}

export interface AvatarImageProps extends React.HTMLAttributes<HTMLImageElement> {
  src: string
  size?: keyof typeof sizes
  name?: string
}

const AvatarPlaceholder = ({ className, label }: { className: string; label: string }) => (
  <div
    className={twMerge(
      'grid select-none grid-cols-1 place-items-center rounded-lg bg-[radial-gradient(circle,_#DDDDDD,_#726B65)] text-white',
      className
    )}
  >
    {label}
  </div>
)

const AvatarImage = ({ src, size = 'medium', className, name }: AvatarImageProps) => {
  const imageLoaded = useHookstate(true)
  const twClassName = twMerge(`${sizes[size]}`, className)
  const label = name
    ? name
        .split(' ')
        .map((s) => s[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  return imageLoaded.value ? (
    <img
      className={twMerge(`${sizes[size]} rounded-full bg-[radial-gradient(circle,_#DDDDDD,_#726B65)]`, className)}
      data-testid="avatar-image"
      src={src}
      alt={src.split('/').at(-1)}
      onError={() => imageLoaded.set(false)}
    />
  ) : (
    <AvatarPlaceholder className={twMerge(`${sizes[size]}`, className)} label={label} />
  )
}

export default AvatarImage
