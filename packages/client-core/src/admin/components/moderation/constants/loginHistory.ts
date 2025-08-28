import { ITableHeadCell } from '@ir-engine/client-core/src/admin/common/Table'
import { t } from 'i18next'

type IdType = 'username' | 'loginTime' | 'userAgent'

export type LoginHistoryRowType = Record<IdType, string | JSX.Element | undefined>

interface ILoginHistoryColumn extends ITableHeadCell {
  id: IdType
}

export const loginHistoryColumns: ILoginHistoryColumn[] = [
  { id: 'username', label: t('admin:components.user.name') },
  { id: 'loginTime', label: t('admin:components.moderation.loginTime') },
  { id: 'userAgent', label: t('admin:components.moderation.userAgent') }
]
