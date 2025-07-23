import { t } from 'i18next'

import { ITableHeadCell } from '../Table'

type IdType =
  | 'id'
  | 'name'
  | 'passcode'
  | 'type'
  | 'action'
  | 'select'
  | 'spawnType'
  | 'spawnDetails'
  | 'targetObjectId'

export type InviteRowType = Record<IdType, string | JSX.Element | undefined>

interface IInviteColumn extends ITableHeadCell {
  id: IdType
}

export const inviteColumns: IInviteColumn[] = [
  { id: 'id', label: t('admin:components.invite.columns.id') },
  { id: 'name', label: t('admin:components.invite.columns.name') },
  { id: 'passcode', label: t('admin:components.invite.columns.passcode') },
  { id: 'type', label: t('admin:components.invite.columns.type') },
  { id: 'targetObjectId', label: t('admin:components.invite.columns.targetObjectId') },
  { id: 'spawnType', label: t('admin:components.invite.columns.spawnType') },
  { id: 'spawnDetails', label: t('admin:components.invite.columns.spawnDetails') },
  { id: 'action', label: t('admin:components.invite.columns.action') }
]
