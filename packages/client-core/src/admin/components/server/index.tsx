import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import Badge from '@ir-engine/ui/src/primitives/tailwind/Badge'
import Tabs from '@ir-engine/ui/src/primitives/tailwind/Tabs'

import { HiOutlineRefresh } from 'react-icons/hi'

import { useHookstate } from '@ir-engine/hyperflux'
import { Button, Select } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

import { serverAutoRefreshOptions } from '../../common/constants/server'
import { useServerInfoFind } from '../../services/ServerInfoQuery'
import ApiJobsTable from './ApiJobsTable'
import MigrationsTable from './MigrationsTable'
import ServerTable from './ServerTable'

export default function Servers() {
  const { t } = useTranslation()
  const serverType = useHookstate('all')
  const serverInfoQuery = useServerInfoFind()

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoRefresh = useHookstate('60')

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const refreshValue = parseInt(autoRefresh.value, 10)
    if (!refreshValue) return
    intervalRef.current = setInterval(serverInfoQuery.refetch, refreshValue * 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh])

  const ServersTopBar = () => {
    return (
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Text theme="secondary" fontSize="sm">
            {t('admin:components.server.autoRefresh')}
          </Text>
          <div className="flex items-center gap-1">
            <Button
              title={t('admin:components.common.refresh')}
              onClick={serverInfoQuery.refetch}
              variant="tertiary"
              className="justify-self-end border-0"
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
      </div>
    )
  }

  const ServerTypeTiles = () => {
    return (
      <div className="mb-4 flex flex-wrap gap-2">
        {serverInfoQuery.data.map((info) => (
          <div
            key={info.id}
            className={`flex h-16 w-44 cursor-pointer items-start justify-between rounded-2xl  p-4 ${
              serverType.value === info.id && 'border-b-2'
            }`}
            onClick={() => serverType.set(info.id)}
          >
            <Text fontSize="sm">{info.label}</Text>
            <Badge
              className="h-6 rounded-[90px] text-white"
              label={`${info.pods.filter((inf) => inf.status === 'Running').length}/${info.pods.length}`}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Tabs
        tabsData={[
          {
            title: t('admin:components.server.servers'),
            tabLabel: t('admin:components.server.servers'),
            rightComponent: <ServersTopBar />,
            bottomComponent: (
              <>
                <ServerTypeTiles />
                <ServerTable serverType={serverType.value} serverInfoQuery={serverInfoQuery} />
              </>
            )
          },
          {
            title: t('admin:components.server.migrations'),
            tabLabel: t('admin:components.server.migrations'),
            bottomComponent: <MigrationsTable />
          },
          {
            title: t('admin:components.server.apiJobs'),
            tabLabel: t('admin:components.server.apiJobs'),
            bottomComponent: <ApiJobsTable />
          }
        ]}
      />
    </>
  )
}
