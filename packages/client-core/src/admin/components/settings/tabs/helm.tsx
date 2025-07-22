import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useFind, useMutation } from '@ir-engine/common'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath, helmVersionPath } from '@ir-engine/common/src/schema.type.module'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button, Select } from '@ir-engine/ui'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

const HelmTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })

  const helmSettings = useFind(engineSettingPath, {
    query: {
      category: 'helm',
      paginate: false
    }
  })

  const helmMain = helmSettings.data.find((setting) => setting.key === EngineSettings.Helm.Builder)?.value
  const helmBuilder = helmSettings.data.find((setting) => setting.key == EngineSettings.Helm.Main)?.value

  const selectedMainVersion = useHookstate(helmMain)

  const helmMainVersions = useFind(helmVersionPath, {
    query: {
      action: 'main'
    }
  }).data
  const mainVersionMenu = helmMainVersions.map((el) => {
    return {
      value: el as string,
      label: el
    }
  })

  const helmBuilderVersions = useFind(helmVersionPath, {
    query: {
      action: 'builder'
    }
  }).data
  const selectedBuilderVersion = useHookstate(helmBuilder)
  const builderVersionMenu = helmBuilderVersions.map((el) => {
    return {
      value: el as string,
      label: el
    }
  })

  const helmMutation = useMutation(engineSettingPath)
  const handleSubmit = (event) => {
    event.preventDefault()

    if (!selectedMainVersion.value || !selectedBuilderVersion.value) return
    state.loading.set(true)

    const setting = {
      main: selectedMainVersion.value,
      builder: selectedBuilderVersion.value
    }

    const operation = Object.values(EngineSettings.Helm).map((key) => {
      const settingInDb = helmSettings.data.find((el) => el.key === key)
      if (!settingInDb) {
        return helmMutation.create({
          key,
          category: 'helm',
          dataType: getDataType(setting[key]),
          value: setting[key],
          type: 'private'
        })
      }
      return helmMutation.patch(settingInDb.id, {
        key,
        category: 'helm',
        value: setting[key],
        type: 'private'
      })
    })

    Promise.all(operation)
      .then(() => {
        state.set({ loading: false, errorMessage: '' })
      })
      .catch((e) => {
        state.set({ loading: false, errorMessage: e.message })
      })
  }

  const handleCancel = () => {
    selectedMainVersion.set(helmMain)
    selectedBuilderVersion.set(helmBuilder)
  }

  useEffect(() => {
    if (helmSettings.status == 'success') {
      selectedMainVersion.set(helmMain)
      selectedBuilderVersion.set(helmBuilder)
    }
  }, [helmSettings.status])

  return (
    <Accordion
      title={t('admin:components.setting.helm.header')}
      subtitle={t('admin:components.setting.helm.subtitle')}
      ref={ref}
      open={open}
    >
      <Text component="p" className="mb-6 mt-2 dark:text-[#A3A3A3]">
        {t('admin:components.setting.helm.subtitle')}
      </Text>

      <div className="mb-6 grid w-full grid-cols-2 gap-2">
        <Select
          labelProps={{
            text: t('admin:components.setting.helm.main'),
            position: 'top'
          }}
          options={mainVersionMenu}
          onChange={(value) => {
            selectedMainVersion.set(value as string)
          }}
          value={selectedMainVersion.value || ''}
        />

        <Select
          labelProps={{
            text: t('admin:components.setting.helm.builder'),
            position: 'top'
          }}
          options={builderVersionMenu}
          onChange={(value) => {
            selectedBuilderVersion.set(value as string)
          }}
          value={selectedBuilderVersion.value || ''}
        />

        <div className="col-span-1 mt-6 grid grid-cols-4 gap-6">
          <Button size="sm" className="text-primary col-span-1 " onClick={handleCancel} fullWidth>
            {t('admin:components.common.reset')}
          </Button>

          <Button size="sm" variant="primary" className="col-span-1" onClick={handleSubmit} fullWidth>
            {state.loading.value && <LoadingView spinnerOnly className="h-6 w-6" />}
            {t('admin:components.common.save')}
          </Button>
        </div>
      </div>
    </Accordion>
  )
})

export default HelmTab
