import React, { ImgHTMLAttributes, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Input } from '../../..'
import { XCloseLg } from '../../../icons'
import ImageUrlFallback from './image-url-fallback.png'

export interface ImageLinkProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onChange' | 'onBlur'> {
  variant?: 'lg' | 'md' | 'sm' | 'full'
  onChange?: (value: string) => void
  onBlur?: (value: string) => void
}

const containerVariants = {
  full: 'h-full w-full gap-y-2',
  lg: 'h-[405px] w-[330px] p-4 gap-y-2',
  md: 'h-[280px] w-[280px] p-2 gap-y-1',
  sm: 'h-[190px] w-[190px] p-2 gap-y-1'
}

const imageVariants = {
  full: 'h-[310px] w-full',
  lg: 'h-[310px] w-[297px]',
  md: 'h-[210px] w-[264px]',
  sm: 'h-[119px] w-[174px]'
}

/**
 * component for displaying an image in the properties panel, provided an `src`
 *
 * props are passed to `<img />`
 *
 * @param props.onChange callback to display an input and receive the new value on each keystroke
 * @param props.onBlur callback to display an input and receive the new value when the input loses focus
 */
export default function ImageLink({ src, onChange, onBlur, variant = 'full', ...props }: ImageLinkProps) {
  const { t } = useTranslation()
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imageRef.current) return
    const onErrorCallback = () => {
      if (!imageRef.current) return
      imageRef.current.src = ImageUrlFallback
    }

    imageRef.current.addEventListener('error', onErrorCallback)

    return () => {
      if (!imageRef.current) return
      imageRef.current.removeEventListener('error', onErrorCallback)
    }
  }, [])

  useEffect(() => {
    if (!src && imageRef.current) {
      imageRef.current.src = ImageUrlFallback
    }
  }, [src])

  return (
    <div className={twMerge('flex flex-col bg-ui-background', containerVariants[variant])}>
      <img
        src={src}
        className={twMerge(
          'mx-auto rounded',
          imageVariants[variant],
          !onChange && !onBlur && variant === 'full' && 'h-[370px]'
        )}
        ref={imageRef}
        {...props}
      />
      {(onChange || onBlur) && (
        <Input
          value={src}
          onChange={(event) => onChange?.(event.target.value)}
          onBlur={(event) => onBlur?.(event.target.value)}
          fullWidth
          endComponent={
            <button
              className="h-4 w-4 text-text-secondary"
              onMouseDown={() => {
                onChange?.('')
                onBlur?.('')
              }}
            >
              <XCloseLg />
            </button>
          }
        />
      )}
    </div>
  )
}
