import DataTable, { ITableHeadCell } from '@ir-engine/client-core/src/admin/common/Table'
import { useFind, useMutation, useSearch } from '@ir-engine/common'
import { moderationBanPath, ModerationBanType } from '@ir-engine/common/src/schema.type.module'
import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { isValidId } from '@ir-engine/common/src/utils/isValidId'
import { t } from 'i18next'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { NotificationService } from '../../../common/services/NotificationService'
import { LocationLabel } from './common/LocationLabel'
import { UserDisplayName } from './common/UserDisplayName'

const moderationBanColumns: ITableHeadCell[] = [
  { id: 'username', label: t('admin:components.moderation.moderationban.columns.username') },
  { id: 'userId', label: t('admin:components.moderation.moderationban.columns.userId') },
  { id: 'reason', label: t('admin:components.moderation.moderationban.columns.reason') },
  { id: 'space', label: t('admin:components.moderation.moderationban.columns.space') },
  { id: 'ipAddress', label: t('admin:components.moderation.moderationban.columns.ipAddress') },
  { id: 'dateReported', label: t('admin:components.moderation.moderationban.columns.dateReported') },
  { id: 'action', label: t('admin:components.moderation.moderationban.columns.action') }
]

export default function ModerationBanTable({ search }) {
  const { t } = useTranslation()
  const moderationBanMutation = useMutation(moderationBanPath)

  const updateBanUser = useCallback(
    (user) => {
      moderationBanMutation
        .patch(user.id, { banned: !user.banned })
        .then(() => {
          NotificationService.dispatchNotify(
            !user.banned ? t('admin:components.moderation.userBanned') : t('admin:components.moderation.userUnBanned'),
            {
              variant: 'success'
            }
          )
        })
        .catch((error) => {
          console.error('Error updating user ban status:', error)
        })
    },
    [moderationBanMutation, t]
  )

  const moderationBanQuery = useFind(moderationBanPath, {
    query: {
      action: 'admin',
      $limit: 20
    }
  })

  useSearch(
    moderationBanQuery,
    {
      $or: [
        {
          banUserId: isValidId(search) ? search : undefined
        },
        {
          banReason: {
            $like: `%${search}%`
          }
        }
      ]
    },
    search
  )

  const createRows = (rows: ModerationBanType[]) =>
    rows.map((row) => ({
      id: row.id,
      username: <UserDisplayName userId={row.banUserId} />,
      userId: row.banUserId,
      space: row.reportedLocationId ? <LocationLabel locationId={row.reportedLocationId} /> : 'N/A',
      reason: t(`user:moderation.abuseReason.${row.banReason}`),
      ipAddress: row.ipAddress,
      dateReported: <span>{toDisplayDateTime(row.createdAt)}</span>,
      action: (
        <button
          onClick={() => updateBanUser(row)}
          className="flex cursor-pointer items-center border-none bg-transparent px-0 py-0 text-blue-500"
        >
          {row.banned ? t('admin:components.moderation.unBan') : t('admin:components.moderation.ban')}
        </button>
      )
    }))

  return (
    <DataTable
      query={moderationBanQuery}
      columns={moderationBanColumns}
      rows={createRows([...moderationBanQuery.data])}
    />
  )
}
