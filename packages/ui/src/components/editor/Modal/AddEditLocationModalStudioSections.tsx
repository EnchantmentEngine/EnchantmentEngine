import React from 'react'
import { useTranslation } from 'react-i18next'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { SceneThumbnailState } from '@ir-engine/editor/src/services/SceneThumbnailState'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { ImageLink } from '@ir-engine/ui/editor'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import { Image01Sm } from '../../../icons'
import LoadingView from '../../../primitives/tailwind/LoadingView'

export default function AddEditLocationModalStudioSections() {
  const { t } = useTranslation()

  const sceneThumbnailState = useMutableState(SceneThumbnailState)

  const isGenerating = useHookstate(false)

  const generateThumbnail = async () => {
    try {
      isGenerating.set(true)
      await SceneThumbnailState.createThumbnail()
      await SceneThumbnailState.uploadThumbnail()
    } catch (e) {
      NotificationService.dispatchNotify(e, { variant: 'error' })
      console.log(e)
    } finally {
      isGenerating.set(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-full flex-row justify-evenly">
        {sceneThumbnailState.thumbnailURL.value ? (
          <ImageLink
            src={sceneThumbnailState.thumbnailURL.value}
            variant="full"
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg bg-surface-3 p-5 text-center text-gray-500">
            {!isGenerating.value ? (
              <>
                <Image01Sm className="h-12 w-12" />
                {t('editor:toolbar.publishLocation.noThumbnailPlaceholder')}
              </>
            ) : (
              <LoadingView className="h-5 w-5" />
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-row justify-end gap-2">
        <Button onClick={generateThumbnail} className="w-full md:w-auto">
          {t('editor:properties.sceneSettings.generate')}
        </Button>
      </div>
    </div>
  )
}
