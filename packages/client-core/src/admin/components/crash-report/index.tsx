import { useMutation } from '@ir-engine/common'
import { metabaseUrlPath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { isEmpty } from 'lodash'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function CrashReport() {
  const { t } = useTranslation()
  const metabaseMutation = useMutation(metabaseUrlPath)
  const iframeUrl = useHookstate<string>('')

  useEffect(() => {
    metabaseMutation
      .create(
        {},
        {
          query: {
            action: 'crash'
          }
        }
      )
      .then(async (url) => {
        iframeUrl.set(url)
      })
  }, [])

  return (
    <>
      <div>
        <Text fontSize="xl" className="mb-6">
          {t('admin:components.crashReport.title')}
        </Text>
      </div>
      <div className="flex h-full w-full flex-col">
        {isEmpty(iframeUrl.value) && (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <LoadingView className="block h-12 w-12" title={t('admin:components.crashReport.loading')} />
          </div>
        )}
        {!isEmpty(iframeUrl.value) && (
          <div className="flex-1 overflow-auto">
            <iframe src={iframeUrl.value} width="100%" height="100%" />
          </div>
        )}
      </div>
    </>
  )
}
