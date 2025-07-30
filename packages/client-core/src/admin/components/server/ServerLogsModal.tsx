import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { GoDownload } from 'react-icons/go'
import { HiOutlineRefresh } from 'react-icons/hi'

import { useGet } from '@ir-engine/common'
import { podsPath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button, Select } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

import { ModalState } from '../../../common/services/ModalState'
import { serverAutoRefreshOptions } from '../../common/constants/server'
import { useServerInfoFind } from '../../services/ServerInfoQuery'

export default function ServerLogsModal({ podName, containerName }: { podName: string; containerName?: string }) {
  const logsEndRef = useRef<HTMLPreElement>(null)
  const { t } = useTranslation()

  const selectedContainerName = useHookstate(containerName)
  const serverLogsQuery = useGet(podsPath, `${podName}/${selectedContainerName.value}`)
  const serverLogs = serverLogsQuery.data

  const serverInfo = useServerInfoFind().data
  const containersOptions =
    serverInfo
      .find((info) => info.id === 'all')
      ?.pods.find((pod) => pod.name === podName)
      ?.containers.map((container) => ({ label: container.name, value: container.name })) || []

  useEffect(() => {
    if (serverLogs) {
      logsEndRef.current?.scrollIntoView()
    }
  }, [serverLogs])

  const handleDownloadServerLogs = () => {
    if (!serverLogs) return
    const blob = new Blob([serverLogs], { type: 'text/plain;charset=utf-8' })
    window.open(URL.createObjectURL(blob), `${serverLogs}.log.txt`)
  }

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoRefresh = useHookstate('60')

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const refreshValue = parseInt(autoRefresh.value, 10)
    if (!refreshValue) return
    intervalRef.current = setInterval(serverLogsQuery.refetch, refreshValue * 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh])

  return (
    <Modal
      className="w-[50vw] max-w-[50vw]"
      title={t('admin:components.server.serverLogs')}
      onClose={() => ModalState.closeModal()}
    >
      <div className="space-y-4">
        <div className="space-between mb-2 flex w-full items-center">
          <Text fontSize="xl" component="h2">
            {t('admin:components.server.logs')}: {podName}
          </Text>
          <Button
            title={t('admin:components.server.downloadLogs')}
            variant="tertiary"
            className="ml-auto border-0"
            onClick={handleDownloadServerLogs}
          >
            <GoDownload />
          </Button>
        </div>
        <div className="flex items-end">
          <Select
            labelProps={{
              text: t('admin:components.server.container'),
              position: 'top'
            }}
            options={containersOptions}
            value={selectedContainerName.value || ''}
            onChange={(value: string) => selectedContainerName.set(value)}
          />
          <div className="ml-auto flex items-center">
            <Button
              title={t('admin:components.common.refresh')}
              onClick={() => serverLogsQuery.refetch()}
              variant="tertiary"
              className="border-0"
            >
              <HiOutlineRefresh />
            </Button>
            <Select
              options={serverAutoRefreshOptions}
              value={autoRefresh.value}
              onChange={(value: string) => autoRefresh.set(value)}
            />
          </div>
        </div>
        <div className="max-h-[50vh] overflow-auto">
          <pre className="bg-stone-300 text-sm font-[var(--lato)] dark:bg-stone-800">{serverLogs}</pre>
          <pre ref={logsEndRef} />
        </div>
      </div>
    </Modal>
  )
}
