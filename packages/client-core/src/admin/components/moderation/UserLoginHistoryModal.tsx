import DataTable from '@ir-engine/client-core/src/admin/common/Table'
import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useFind } from '@ir-engine/common'
import { userLoginPath } from '@ir-engine/common/src/schema.type.module'
import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { UserDisplayName } from './common/UserDisplayName'
import { LoginHistoryRowType, loginHistoryColumns } from './constants/loginHistory'

export const UserLoginHistoryModal = ({ ipAddress }: { ipAddress: string }) => {
  const { t } = useTranslation()

  // Calculate date one month ago
  const oneMonthAgo = useMemo(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString()
  }, [])

  // Fetch login history for the IP address
  const loginHistoryQuery = useFind(userLoginPath, {
    query: {
      ipAddress,
      createdAt: {
        $gte: oneMonthAgo
      },
      $sort: {
        createdAt: -1
      },
      $limit: 10
    }
  })

  // Create rows for the data table
  const createRows = (rows: readonly any[]): LoginHistoryRowType[] =>
    rows.map((login) => {
      return {
        username: <UserDisplayName userId={login.userId} />,
        loginTime: toDisplayDateTime(login.createdAt),
        userAgent: (
          <div className="max-w-xs truncate" title={login.userAgent}>
            {login.userAgent}
          </div>
        )
      }
    })

  return (
    <Modal
      title={t('admin:components.moderation.loginHistory')}
      onClose={() => ModalState.closeModal()}
      className="w-[80vw] max-w-4xl"
      rawChildren={
        <div className="flex flex-col p-6">
          <Text className="mb-4">{t('admin:components.moderation.loginHistoryDescription', { ipAddress })}</Text>

          <DataTable
            size="md"
            query={loginHistoryQuery}
            columns={loginHistoryColumns}
            rows={createRows(loginHistoryQuery.data)}
          />
        </div>
      }
    />
  )
}
