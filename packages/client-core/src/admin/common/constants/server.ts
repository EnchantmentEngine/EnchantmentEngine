import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType = 'name' | 'status' | 'type' | 'currentUsers' | 'restarts' | 'age' | 'instanceId' | 'action'

export type ServerRowType = Record<IdType, string | JSX.Element | undefined>

interface IServerColumn extends ITableHeadCell {
  id: IdType
}

export const serverColumns: IServerColumn[] = [
  { id: 'name', label: t('admin:components.server.name') },
  { id: 'status', label: t('admin:components.server.status') },
  { id: 'type', label: t('admin:components.server.type') },
  { id: 'currentUsers', label: t('admin:components.server.users') },
  { id: 'restarts', label: t('admin:components.server.restarts') },
  { id: 'age', label: t('admin:components.server.age') },
  { id: 'instanceId', label: t('admin:components.server.instance') },
  { id: 'action', label: t('admin:components.server.actions') }
]

export const serverAutoRefreshOptions = [
  {
    value: '0',
    label: t('admin:components.server.none')
  },
  {
    value: '10',
    label: `10 ${t('admin:components.server.seconds')}`
  },
  {
    value: '30',
    label: `30 ${t('admin:components.server.seconds')}`
  },
  {
    value: '60',
    label: `1 ${t('admin:components.server.minute')}`
  },
  {
    value: '300',
    label: `5 ${t('admin:components.server.minutes')}`
  },
  {
    value: '600',
    label: `10 ${t('admin:components.server.minutes')}`
  }
]
