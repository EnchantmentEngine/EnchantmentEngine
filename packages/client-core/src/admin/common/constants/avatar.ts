import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType = 'id' | 'name' | 'user' | 'isPublic' | 'thumbnail' | 'action'

export type AvatarRowType = Record<IdType, string | JSX.Element | undefined>

interface IAvatarColumn extends ITableHeadCell {
  id: IdType
}

export const avatarColumns: IAvatarColumn[] = [
  { id: 'id', label: t('admin:components.avatar.columns.id') },
  { id: 'name', label: t('admin:components.avatar.columns.name') },
  { id: 'user', label: t('admin:components.avatar.columns.user') },
  { id: 'isPublic', label: t('admin:components.avatar.columns.isPublic') },
  {
    id: 'thumbnail',
    label: t('admin:components.avatar.columns.thumbnail'),
    className: 'text-center'
  },
  {
    id: 'action',
    label: t('admin:components.avatar.columns.action')
  }
]
