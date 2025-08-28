import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import TextArea from '@ir-engine/ui/src/primitives/tailwind/TextArea'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineDocumentDuplicate } from 'react-icons/hi2'

type Props = Readonly<{
  url: string
  containerClassName?: string
  className?: string
  labelClassname?: string
  showLabel?: boolean
}>

export const EmbedCodeField = ({
  url,
  containerClassName = 'text-text-secondary',
  className = 'h-20 border-ui-tertiary bg-[#F6F8FA] dark:border-ui-outline dark:bg-surface-2',
  labelClassname = 'text-xs text-text-secondary',
  showLabel = true
}: Props) => {
  const { t } = useTranslation()

  // Check if URL is provided
  const isUrlProvided = url && url.trim() !== ''

  // Create embed code only if URL is provided
  const embedCode = `<iframe src="${url}"
    height="100%" width="100%" allow="camera 'src'; microphone 'src';xr-spatial-tracking" style="pointer-events:all;user-select:none;border:none;"></iframe>`
  const handleCopyEmbed = () => {
    navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        NotificationService.dispatchNotify(t('common:components.embedCodeCopied'), {
          variant: 'success'
        })
      })
      .catch((err) => {
        NotificationService.dispatchNotify(`Failed to copy URL: ${err.message}`, { variant: 'error' })
      })
  }

  // If URL is not provided, show a simple message instead of the textarea
  if (!isUrlProvided) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="w-full rounded border border-ui-outline bg-surface-2 p-4 text-center text-text-secondary">
          {t('common:components.publishSceneFirstMessage')}
        </div>
      </div>
    )
  }

  return (
    <TextArea
      containerClassName={containerClassName}
      className={className}
      labelClassname={labelClassname}
      label={showLabel ? t('common:components.embed') : undefined}
      value={embedCode}
      readOnly
      endComponent={
        <div className="mr-6 hover:cursor-pointer" onClick={handleCopyEmbed}>
          <HiOutlineDocumentDuplicate className="text-xl text-text-tertiary" />
        </div>
      }
    />
  )
}
