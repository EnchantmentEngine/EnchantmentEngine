import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType = 'project' | 'route' | 'action'

export type RouteRowType = Record<IdType, string | JSX.Element | undefined>

interface IRouteColumn extends ITableHeadCell {
  id: IdType
}

export const routeColumns: IRouteColumn[] = [
  { id: 'project', label: t('admin:components.route.columns.project') },
  { id: 'route', label: t('admin:components.route.columns.route') },
  { id: 'action', label: t('admin:components.route.columns.action') }
]
