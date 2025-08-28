import React from 'react'
import { useTranslation } from 'react-i18next'

import { useFind } from '@ir-engine/common'
import { apiJobPath, ApiJobType } from '@ir-engine/common/src/schema.type.module'

import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import Badge from '@ir-engine/ui/src/primitives/tailwind/Badge'
import { apiJobColumns } from '../../common/constants/api-job'
import DataTable from '../../common/Table'

function ApiJobStatus({ apiJob }: { apiJob: ApiJobType }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-3">
      {apiJob.status === 'succeeded' && (
        <Badge className="rounded" variant="success" label={t('admin:components.server.serverStatus.succeeded')} />
      )}
      {apiJob.status === 'pending' && (
        <Badge className="rounded" variant="warning" label={t('admin:components.server.serverStatus.pending')} />
      )}
      {apiJob.status === 'failed' && (
        <Badge className="rounded" variant="danger" label={t('admin:components.server.serverStatus.failed')} />
      )}
    </div>
  )
}

export default function ApiJobsTable() {
  const { t } = useTranslation()

  const adminApiJobsQuery = useFind(apiJobPath, {
    query: {
      $limit: 100,
      $sort: {
        startTime: -1
      }
    }
  })

  const createRows = (rows): ApiJobType[] =>
    rows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      status: <ApiJobStatus apiJob={row} />,
      startTime: toDisplayDateTime(row.startTime),
      endTime: toDisplayDateTime(row.endTime),
      returnData: row.returnData
    }))

  return (
    <DataTable size="sm" query={adminApiJobsQuery} columns={apiJobColumns} rows={createRows(adminApiJobsQuery.data)} />
  )
}
