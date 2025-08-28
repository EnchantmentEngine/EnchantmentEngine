import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType = 'id' | 'action' | 'name' | 'select'

export type ChannelRowType = Record<IdType, string | JSX.Element | undefined>

interface IChannelColumn extends ITableHeadCell {
  id: IdType
}

export const channelColumns: IChannelColumn[] = [
  { id: 'id', label: t('admin:components.channel.columns.id') },
  { id: 'name', label: t('admin:components.channel.columns.name') },
  { id: 'action', label: t('admin:components.channel.columns.action') }
]
