import { useFind, useMutation } from '@ir-engine/common'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { EngineSettingData, EngineSettingType, engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button, Input } from '@ir-engine/ui'
import PasswordInput from '@ir-engine/ui/src/components/tailwind/PasswordInput'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const MetabaseTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate<{ loading: boolean; errorMessage: string }>({
    loading: false,
    errorMessage: ''
  })
  const siteUrl = useHookstate('')
  const secretKey = useHookstate('')
  const environment = useHookstate('')
  const expiration = useHookstate('10')
  const crashDashboardId = useHookstate('')
  const metabaseSettingMutation = useMutation(engineSettingPath)

  const engineSettings = useFind(engineSettingPath, {
    query: {
      category: 'metabase',
      paginate: false
    }
  }).data

  const secretValue = engineSettings.find((el) => el.key === EngineSettings.Metabase.SecretKey)?.value || ''
  const siteUrlValue = engineSettings.find((el) => el.key === EngineSettings.Metabase.SiteUrl)?.value || ''
  const environmentValue = engineSettings.find((el) => el.key === EngineSettings.Metabase.Environment)?.value || ''
  const expirationValue = engineSettings.find((el) => el.key === EngineSettings.Metabase.Expiration)?.value || '10'
  const crashDashboardIdValue =
    engineSettings.find((el) => el.key === EngineSettings.Metabase.CrashDashboardId)?.value || ''

  useEffect(() => {
    if (engineSettings.length) {
      siteUrl.set(siteUrlValue)
      secretKey.set(secretValue)
      environment.set(environmentValue)
      expiration.set(expirationValue)
      crashDashboardId.set(crashDashboardIdValue)
    }
  }, [engineSettings])

  const handleSubmit = async (event) => {
    try {
      event.preventDefault()

      if (!siteUrl.value || !secretKey.value || !environment.value) return

      state.loading.set(true)

      const setting = {
        siteUrl: siteUrl.value,
        secretKey: secretKey.value,
        environment: environment.value,
        crashDashboardId: crashDashboardId.value
      }

      const createData: EngineSettingData[] = []
      const operations: Promise<EngineSettingType | EngineSettingType[]>[] = []

      Object.values(EngineSettings.Metabase).forEach((key) => {
        const settingInDb = engineSettings.find((el) => el.key === key)
        if (!settingInDb) {
          createData.push({
            key,
            category: 'metabase',
            value: setting[key],
            dataType: getDataType(setting[key]),
            type: 'private'
          })
        } else if (settingInDb.value !== setting[key]) {
          operations.push(
            metabaseSettingMutation.patch(settingInDb.id, {
              key,
              category: 'metabase',
              value: setting[key],
              dataType: getDataType(setting[key]),
              type: 'private'
            })
          )
        }
      })

      if (createData.length > 0) {
        const createOperation = metabaseSettingMutation.create(createData)
        operations.push(createOperation)
      }

      await Promise.all(operations)
      state.set({ loading: false, errorMessage: '' })
    } catch (e) {
      state.set({ loading: false, errorMessage: e.message })
    }
  }

  const handleCancel = () => {
    if (engineSettings.length) {
      siteUrl.set(siteUrlValue)
      secretKey.set(secretValue)
      environment.set(environmentValue)
      expiration.set(expirationValue)
      crashDashboardId.set(crashDashboardIdValue)
    }
  }

  return (
    <Accordion
      title={t('admin:components.setting.metabase.header')}
      subtitle={t('admin:components.setting.metabase.subtitle')}
      ref={ref}
      open={open}
    >
      <div className="my-6 grid grid-cols-3 gap-6">
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.metabase.siteUrl'),
            position: 'top'
          }}
          value={siteUrl?.value || ''}
          onChange={(e) => siteUrl.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.metabase.environment'),
            position: 'top'
          }}
          value={environment?.value || ''}
          onChange={(e) => environment.set(e.target.value)}
        />

        <PasswordInput
          fullWidth
          labelProps={{
            text: t('admin:components.setting.metabase.secretKey'),
            position: 'top'
          }}
          value={secretKey?.value || ''}
          onChange={(e) => secretKey.set(e.target.value)}
        />

        <Input
          fullWidth
          type="number"
          labelProps={{
            text: t('admin:components.setting.metabase.expiration'),
            position: 'top'
          }}
          value={expiration?.value || 10}
          onChange={(e) => expiration.set(e.target.value)}
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.metabase.crashDashboardId'),
            position: 'top'
          }}
          value={crashDashboardId?.value || ''}
          onChange={(e) => crashDashboardId.set(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-8 gap-6">
        <Button size="sm" className="text-primary col-span-1 " fullWidth onClick={handleCancel}>
          {t('admin:components.common.reset')}
        </Button>
        <Button size="sm" variant="primary" className="col-span-1" fullWidth onClick={handleSubmit}>
          {state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
          {t('admin:components.common.save')}
        </Button>
      </div>
    </Accordion>
  )
})

export default MetabaseTab
