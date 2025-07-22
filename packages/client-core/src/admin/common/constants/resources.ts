import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType = 'id' | 'key' | 'mimeType' | 'project' | 'action'

export type ResourceRowType = Record<IdType, string | JSX.Element | undefined>

interface IResourceColumn extends ITableHeadCell {
  id: IdType
}

export const resourceColumns: IResourceColumn[] = [
  { id: 'id', label: t('admin:components.resources.columns.id') },
  { id: 'key', sortable: true, label: t('admin:components.resources.columns.key') },
  { id: 'mimeType', sortable: true, label: t('admin:components.resources.columns.mimeType') },
  { id: 'project', sortable: true, label: t('admin:components.resources.columns.project') },
  {
    id: 'action',
    label: t('admin:components.resources.columns.action')
  }
]
