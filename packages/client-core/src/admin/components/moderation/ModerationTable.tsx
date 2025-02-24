/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import DataTable, { ITableHeadCell } from '@ir-engine/client-core/src/admin/common/Table'
import { useFind } from '@ir-engine/common'
import { moderationPath, ModerationType } from '@ir-engine/common/src/schemas/moderation/moderation.schema'
import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { Button, Select } from '@ir-engine/ui'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import { t } from 'i18next'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoArrowForward } from 'react-icons/io5'
import { UserDisplayName } from './common/UserDisplayName'
import { ModerationBanContainer } from './ModerationBanContainer'
import { ModerationDetail } from './ModerationDetail'

const moderationTableColumns: ITableHeadCell[] = [
  { id: 'type', label: t('admin:components.moderation.type') },
  { id: 'username', label: t('admin:components.moderation.usernameBeingReported') },
  { id: 'reason', label: t('admin:components.moderation.reason') },
  { id: 'status', label: t('admin:components.moderation.status') },
  { id: 'dateReported', label: t('admin:components.moderation.dateReported') },
  { id: 'action', label: t('admin:components.moderation.action') }
]

export default function ModerationTable() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedReport, setSelectedReport] = useState<ModerationType>()
  const [showBanUsers, setShowBanUsers] = useState(false)

  const handleViewDetails = (report) => {
    setSelectedReport(report)
  }
  const handleBackToTable = () => {
    setSelectedReport(undefined)
  }
  const handleManageBansClick = () => {
    setShowBanUsers(true)
  }
  const handleReportResolve = (report: ModerationType) => {
    setSelectedReport(userReportsQuery.data[userReportsQuery.data.findIndex((r) => r.id === report.id) + 1])
  }

  const createRows = (rows: ModerationType[]) =>
    rows.map((moderation) => {
      return {
        id: moderation.id,
        type: <span>{moderation.type == 'Location' ? t('admin:components.moderation.space') : moderation.type}</span>,
        username: (
          <span>
            <UserDisplayName userId={moderation.reportedUserId} />
          </span>
        ),
        reason: <span>{moderation.abuseReason}</span>,
        dateReported: <span>{toDisplayDateTime(moderation.createdAt)}</span>,
        status: (
          <span
            className={`rounded px-2 py-1 ${
              moderation.status === 'Open' ? 'bg-[#10b981] text-white' : 'bg-[#2f3137] text-white'
            }`}
          >
            {moderation.status}
          </span>
        ),
        action: (
          <button
            onClick={() => handleViewDetails(moderation)}
            className="flex cursor-pointer items-center border-none bg-transparent px-0 py-0 text-blue-500"
          >
            {t('admin:components.moderation.viewDetails')} <IoArrowForward className="ml-2" />
          </button>
        )
      }
    })

  const userReportsQuery =
    statusFilter == 'All'
      ? useFind(moderationPath, {
          query: {
            $limit: 12
          }
        })
      : useFind(moderationPath, {
          query: {
            status: statusFilter,
            $limit: 12
          }
        })

  if (userReportsQuery.status !== 'success') {
    return <LoadingView fullScreen className="block h-12 w-12" title={t('admin:components.moderation.loading')} />
  }

  return (
    <div className="h-full w-full">
      {selectedReport ? (
        <ModerationDetail report={selectedReport} onBack={handleBackToTable} onResloved={handleReportResolve} />
      ) : (
        <>
          {showBanUsers ? (
            <ModerationBanContainer onBack={() => setShowBanUsers(false)} />
          ) : (
            <>
              <h2 className="mb-5 text-2xl">{t('admin:components.moderation:header')}</h2>
              <div className="mb-4 rounded-lg p-4 shadow" style={{ backgroundColor: '#212226' }}>
                <div className="mb-2 flex items-center justify-between">
                  <h1 className="text-xl text-[#a3a3a3]">{t('admin:components.moderation.bannedUsers')}</h1>
                  <Button
                    variant="primary"
                    className="col-span-1 mt-4 rounded bg-blue-500 px-4 py-2 text-white"
                    onClick={handleManageBansClick}
                  >
                    {t('admin:components.moderation.manageBans')}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{t('admin:components.moderation.manageAccess')}</p>
              </div>
              <div className="w-50 mb-4 mt-5 flex items-center space-x-2">
                <Select
                  labelProps={{ text: t('admin:components.moderation.statusFilter'), position: 'left' }}
                  options={['All', 'Open', 'Resolved'].map((option) => {
                    return { label: option, value: option }
                  })}
                  value={statusFilter}
                  onChange={(selected) => setStatusFilter(selected as string)}
                />
              </div>
              <DataTable
                query={userReportsQuery}
                columns={moderationTableColumns}
                rows={createRows([...userReportsQuery.data])}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}
