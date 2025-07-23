import { Button } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React, { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FiEdit2 } from 'react-icons/fi'
import { HiPencil } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'
import { handleSoundEffect } from '../../utils'

interface Props {
  alt?: string
  id?: string
  imageSrc?: string
  isSelected?: boolean
  name?: string
  showChangeButton?: boolean
  type?: 'round' | 'rectangle' | 'thumbnail' | 'square'
  size?: number
  onChange?: () => void
  onClick?: () => void
  playAudio?: boolean
}

const Avatar = ({
  alt,
  imageSrc,
  isSelected,
  name,
  showChangeButton,
  type,
  size,
  onChange,
  onClick,
  playAudio = true
}: Props) => {
  const { t } = useTranslation()
  const handleChange = (e: MouseEvent) => {
    e.stopPropagation()
    onChange && onChange()
  }

  if (type === 'square') {
    return (
      <div
        onClick={onClick}
        onPointerUp={playAudio ? handleSoundEffect : undefined}
        onPointerEnter={playAudio ? handleSoundEffect : undefined}
        className={twMerge(
          'relative flex cursor-pointer flex-col items-center gap-2',
          isSelected ? 'opacity-100' : 'opacity-80 hover:opacity-100'
        )}
      >
        <div
          className={twMerge(
            'relative overflow-hidden rounded-2xl bg-gradient-to-b from-blue-400 to-blue-600',
            isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' : ''
          )}
          style={size ? { width: `${size}rem`, height: `${size}rem` } : {}}
        >
          <img className="h-full w-full object-cover" src={imageSrc} alt={alt} crossOrigin="anonymous" />
          <div className="absolute bottom-0 w-full overflow-hidden bg-blue-500/50 px-4 py-1 text-center">
            <Text fontWeight="medium" fontSize="sm" className="w-full truncate text-white">
              {name}
            </Text>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'rectangle') {
    return (
      <div
        onClick={onClick}
        onPointerUp={playAudio ? handleSoundEffect : undefined}
        onPointerEnter={playAudio ? handleSoundEffect : undefined}
        className={twMerge(
          'relative box-border flex h-[6.5rem] max-h-32 max-w-96 cursor-pointer items-start gap-3 rounded-lg bg-surface-2 p-3 shadow-sm ',
          isSelected ? 'border-2 border-ui-select-primary' : 'border border-ui-outline'
        )}
      >
        <img className="h-auto w-20 max-w-20 self-center" src={imageSrc} alt={alt} crossOrigin="anonymous" />
        {showChangeButton && (
          <Button
            size="sm"
            fullWidth={false}
            variant="secondary"
            data-testid="edit-avatar-button"
            className="absolute bottom-3 left-[4.25rem] h-8 w-10 rounded-md border-[#162546] border-opacity-65 text-white"
            onClick={handleChange}
          >
            <FiEdit2 size={16} />
          </Button>
        )}
        <Text
          fontWeight="medium"
          fontSize="base"
          className="line-clamp-2  w-full text-ellipsis text-wrap text-text-primary"
        >
          {name}
        </Text>
      </div>
    )
  } else if (type === 'thumbnail') {
    return (
      <div className="flex rounded-full">
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          alt={alt}
          src={imageSrc}
          crossOrigin="anonymous"
          width={`${size}px`}
          height={`${size}px`}
        />
        {!imageSrc && (
          <Text fontWeight="semibold" fontSize="base" className="w-full text-ellipsis text-wrap">
            {t('admin:components.avatar.thumbnailPreview')}
          </Text>
        )}
      </div>
    )
  }

  return (
    <div className="flex rounded-full">
      <img
        style={{
          height: 'auto',
          maxWidth: '100%'
        }}
        alt={alt}
        src={imageSrc}
        crossOrigin="anonymous"
        width={`${size}px`}
        height={`${size}px`}
      />
      {showChangeButton && (
        <Button
          size="xs"
          variant="secondary"
          data-testid="edit-avatar-button"
          className="h-8 w-10 rounded-full border-[#162546] border-opacity-65 text-white"
          onClick={handleChange}
        >
          <HiPencil size={16} />
        </Button>
      )}
    </div>
  )
}

export default Avatar
