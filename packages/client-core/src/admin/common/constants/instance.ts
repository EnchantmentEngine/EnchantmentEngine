import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType = 'id' | 'ipAddress' | 'currentUsers' | 'ended' | 'locationName' | 'channelId' | 'podName' | 'action'

export type InstanceRowType = Record<IdType, string | JSX.Element | undefined>

interface IInstanceColumn extends ITableHeadCell {
  id: IdType
}

export const instanceColumns: IInstanceColumn[] = [
  { id: 'id', label: t('admin:components.instance.columns.id') },
  { id: 'ipAddress', label: t('admin:components.instance.columns.ipAddress') },
  { id: 'currentUsers', sortable: true, label: t('admin:components.instance.columns.currentUsers') },
  { id: 'ended', sortable: true, label: t('admin:components.instance.columns.isActive') },
  { id: 'locationName', label: t('admin:components.instance.columns.locationName') },
  { id: 'channelId', label: t('admin:components.instance.columns.channelId') },
  { id: 'podName', label: t('admin:components.instance.columns.podName') },
  { id: 'action', label: t('admin:components.instance.columns.action') }
]
