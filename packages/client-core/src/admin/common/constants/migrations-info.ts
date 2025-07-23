import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType = 'id' | 'name' | 'batch' | 'migration_time'

export type MigrationsInfoRowType = Record<IdType, string | JSX.Element | undefined>

interface IMigrationsInfoColumn extends ITableHeadCell {
  id: IdType
}

export const migrationsInfoColumns: IMigrationsInfoColumn[] = [
  { id: 'id', label: t('admin:components.server.columns.migrationsInfo.id') },
  { id: 'name', label: t('admin:components.server.columns.migrationsInfo.name') },
  { id: 'batch', label: t('admin:components.server.columns.migrationsInfo.batch') },
  { id: 'migration_time', label: t('admin:components.server.columns.migrationsInfo.migration_time'), sortable: true }
]
