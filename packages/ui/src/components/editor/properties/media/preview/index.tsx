import { State, useHookstate } from '@ir-engine/hyperflux'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LuInfo } from 'react-icons/lu'
import { twMerge } from 'tailwind-merge'
import Text from '../../../../../primitives/tailwind/Text'
import Tooltip from '../../../../../primitives/tailwind/Tooltip'
import InputGroup from '../../../input/Group'
import SelectInput from '../../../input/Select'

interface MediaPlayerProps {
  resources: State<string[]> //  State<ArrayStatic<TStringSchema>, {}>// ReadonlyArray<string>
}

const MediaPreview: React.FC<MediaPlayerProps> = ({ resources }) => {
  const { t } = useTranslation()

  // Get the array of URLs as strings based on the type
  const resourceList = resources.value
  const options = resourceList.map((resource) => ({
    label: resource.split('/').pop()!.split('?')[0] || resource, // Display file name
    value: resource
  }))
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)
  const selectedMedia = useHookstate(resourceList[0])
  const mediaType = useHookstate(getMediaType(resourceList[0]))

  // Helper function to determine media type based on file extension
  function getMediaType(url: string) {
    const extension = url.split('.').pop()?.toLowerCase().split('?')[0]
    return ['mp4', 'webm'].includes(extension || '') ? 'video' : 'audio'
  }

  // Handle media selection change
  const handleMediaChange = (value: string) => {
    const selectedUrl = value
    selectedMedia.set(selectedUrl)
    mediaType.set(getMediaType(selectedUrl))
    if (mediaRef.current) {
      mediaRef.current.load() // Reload the media file
    }
  }

  useEffect(() => {
    handleMediaChange(resourceList[0] ?? '')
  }, [resources])

  return (
    <div
      id={'media-preview-root-div'}
      className={'flex-grow space-y-1 rounded-md border-2 border-solid border-gray-600 bg-[#1F1F1F] py-1.5'}
    >
      <div id={'media-preview-label'} className={'flex-column mb-2 flex gap-2'}>
        <Text className="ml-5">{t('editor:properties.media-preview.lbl-mediaPreview')}</Text>
        <Tooltip content={t('editor:properties.media-preview.info-mediaPreview')}>
          <LuInfo className={twMerge('h-5 w-5', 'text-[#A0A1A2]')} />
        </Tooltip>
      </div>
      {/* Dropdown to select media file */}
      <InputGroup label={t('editor:properties.media-preview.lbl-selected-source')}>
        <SelectInput value={selectedMedia.value} options={options} onChange={(e) => handleMediaChange(e as string)} />
      </InputGroup>

      {mediaType.value === 'video' ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={selectedMedia.value}
          width="300"
          controls={true}
          className="w-full flex-grow p-2.5"
        />
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={selectedMedia.value}
          controls={true}
          className="w-full flex-grow p-2.5"
        />
      )}
    </div>
  )
}

export default MediaPreview
