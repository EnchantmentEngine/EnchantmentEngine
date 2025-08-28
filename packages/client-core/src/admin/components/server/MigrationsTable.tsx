import React from 'react'
import { useTranslation } from 'react-i18next'

import { useFind } from '@ir-engine/common'
import { migrationsInfoPath, MigrationsInfoType } from '@ir-engine/common/src/schema.type.module'

import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { migrationsInfoColumns, MigrationsInfoRowType } from '../../common/constants/migrations-info'
import DataTable from '../../common/Table'

export default function MigrationsInfoTable() {
  const { t } = useTranslation()

  const adminMigrationsInfoQuery = useFind(migrationsInfoPath, {
    query: {
      $limit: 100,
      $sort: {
        id: -1
      }
    }
  })

  const createRows = (rows: readonly MigrationsInfoType[]): MigrationsInfoRowType[] =>
    rows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      batch: row.batch.toString(),
      migration_time: toDisplayDateTime(row.migration_time)
    }))

  return (
    <DataTable
      size="sm"
      query={adminMigrationsInfoQuery}
      columns={migrationsInfoColumns}
      rows={createRows(adminMigrationsInfoQuery.data)}
    />
  )
}
