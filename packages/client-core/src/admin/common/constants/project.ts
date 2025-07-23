import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType = 'name' | 'projectVersion' | 'enabled' | 'visibility' | 'commitSHA' | 'commitDate' | 'actions'

export type ProjectRowType = Record<IdType, string | JSX.Element | undefined>

interface IProjectColumn extends ITableHeadCell {
  id: IdType
}

export const projectsColumns: IProjectColumn[] = [
  { id: 'name', sortable: true, label: t('admin:components.project.columns.name') },
  { id: 'projectVersion', label: t('admin:components.project.columns.projectVersion') },
  { id: 'enabled', sortable: true, label: t('admin:components.project.columns.enabled') },
  { id: 'visibility', sortable: true, label: t('admin:components.project.columns.visibility') },
  { id: 'commitSHA', label: t('admin:components.project.columns.commitSHA') },
  { id: 'commitDate', sortable: true, label: t('admin:components.project.columns.commitDate') },
  { id: 'actions', label: t('admin:components.project.columns.actions') }
]
