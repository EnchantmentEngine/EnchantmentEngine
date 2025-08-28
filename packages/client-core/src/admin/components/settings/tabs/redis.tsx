import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useFind } from '@ir-engine/common'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schema.type.module'
import { Input } from '@ir-engine/ui'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'

const RedisTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const redisSetting = useFind(engineSettingPath, {
    query: {
      category: 'redis',
      paginate: false
    }
  }).data

  const address = redisSetting?.find((setting: EngineSettingType) => setting.key === EngineSettings.Redis.Address)
    ?.value
  const password = redisSetting?.find((setting: EngineSettingType) => setting.key === EngineSettings.Redis.Password)
    ?.value
  const port = redisSetting?.find((setting: EngineSettingType) => setting.key === EngineSettings.Redis.Port)?.value
  const enabled = redisSetting?.find((setting: EngineSettingType) => setting.key === EngineSettings.Redis.Enabled)
    ?.value

  return (
    <Accordion
      title={t('admin:components.setting.redis.header')}
      subtitle={t('admin:components.setting.redis.subtitle')}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-2 gap-6">
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.address'),
            position: 'top'
          }}
          value={address || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.password'),
            position: 'top'
          }}
          value={password || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.port'),
            position: 'top'
          }}
          value={port || ''}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.enabled'),
            position: 'top'
          }}
          value={enabled || ''}
          disabled
        />
      </div>
    </Accordion>
  )
})

export default RedisTab
