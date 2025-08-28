import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useFind } from '@ir-engine/common'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { Input } from '@ir-engine/ui'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'

const TaskServerTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()

  const settingTaskServer = useFind(engineSettingPath, {
    query: {
      category: 'task-server',
      paginate: false
    }
  }).data

  const ports = settingTaskServer.filter((el) => el.key === EngineSettings.TaskServer.Port).map((el) => el.value)
  const processIntervals = settingTaskServer
    .filter((el) => el.key === EngineSettings.TaskServer.ProcessInterval)
    .map((el) => el.value)

  return (
    <Accordion
      title={t('admin:components.setting.taskServer.taskServer')}
      subtitle={t('admin:components.setting.taskServer.subtitle')}
      ref={ref}
      open={open}
    >
      <div className="mt-6 grid grid-cols-2 gap-6">
        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.taskServer.port'),
            position: 'top'
          }}
          value={ports.join(', ')}
          disabled
        />

        <Input
          fullWidth
          labelProps={{
            text: t('admin:components.setting.taskServer.processInterval'),
            position: 'top'
          }}
          value={processIntervals.join(', ')}
          disabled
        />
      </div>
    </Accordion>
  )
})

export default TaskServerTab
