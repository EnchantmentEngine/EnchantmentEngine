import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType = 'id' | 'name' | 'status' | 'startTime' | 'endTime' | 'returnData'

export type ApiJobRowType = Record<IdType, string | JSX.Element | undefined>

interface IApiJobColumn extends ITableHeadCell {
  id: IdType
}

export const apiJobColumns: IApiJobColumn[] = [
  { id: 'id', label: t('admin:components.server.columns.apiJobs.id') },
  { id: 'name', label: t('admin:components.server.columns.apiJobs.name') },
  { id: 'status', label: t('admin:components.server.columns.apiJobs.status') },
  { id: 'startTime', label: t('admin:components.server.columns.apiJobs.start_time'), sortable: true },
  { id: 'endTime', label: t('admin:components.server.columns.apiJobs.end_time'), sortable: true },
  { id: 'returnData', label: t('admin:components.server.columns.apiJobs.return_data') }
]
