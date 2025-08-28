import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType = 'id' | 'status' | 'dateStarted' | 'dateEnded' | 'logs' | 'commitSHA'

export type BuildStatusRowType = Record<IdType, string | JSX.Element | undefined>

interface IBuildStatusColumn extends ITableHeadCell {
  id: IdType
}

export const buildStatusColumns: IBuildStatusColumn[] = [
  { id: 'id', label: t('admin:components.buildStatus.columns.id') },
  { id: 'status', label: t('admin:components.buildStatus.columns.status') },
  { id: 'commitSHA', label: t('admin:components.buildStatus.columns.commitSHA') },
  { id: 'logs', label: t('admin:components.buildStatus.columns.logs') },
  { id: 'dateStarted', label: t('admin:components.buildStatus.columns.dateStarted'), sortable: true },
  { id: 'dateEnded', label: t('admin:components.buildStatus.columns.dateEnded'), sortable: true }
]
