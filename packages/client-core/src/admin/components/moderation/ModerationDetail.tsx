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

import { useFind, useMutation } from '@ir-engine/common'
import {
  locationAdminPath,
  moderationAttachmentPath,
  moderationBanPath,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { moderationPath, ModerationType } from '@ir-engine/common/src/schemas/moderation/moderation.schema'
import { toDisplayDateTime, toDisplayDateTimeUtc } from '@ir-engine/common/src/utils/datetime-sql'
import { Button } from '@ir-engine/ui'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { IoArrowBack } from 'react-icons/io5'
import { NotificationService } from '../../../common/services/NotificationService'
import { LocationLabel } from './common/LocationLabel'
import { UserInfo } from './common/UserInfo'

export const ModerationDetail = ({
  report,
  onBack,
  onResloved
}: {
  report: ModerationType
  onBack: () => void
  onResloved: (report: ModerationType) => void
}) => {
  const isPersonModeration = report.type === 'Person'
  const { t } = useTranslation()
  const moderationMutation = useMutation(moderationPath)
  const moderationBanMutation = useMutation(moderationBanPath)

  const moderationBanQuery = useFind(moderationBanPath, {
    query: {
      action: 'admin',
      banUserId: report.reportedUserId
    }
  })

  const locationAdminQuery = isPersonModeration
    ? useFind(locationAdminPath, {
        query: {
          action: 'admin',
          userId: report.reportedUserId,
          locationId: report.reportedLocationId
        }
      })
    : null

  const handleMarkAsHandled = () => {
    const result = moderationMutation.patch(report.id, {
      status: 'Resolved'
    })
    result
      .then(() => {
        onResloved(report)
        NotificationService.dispatchNotify(t('admin:components.moderation.reportResolved'), {
          variant: 'success'
        })
      })
      .catch((error) => {
        NotificationService.dispatchNotify(error.message, { variant: 'error' })
        console.error(error)
      })
  }

  const handleBanUser = () => {
    if (moderationBanQuery.data.length > 0) {
      moderationBanMutation
        .patch(moderationBanQuery.data[0].id, {
          banned: true
        })
        .then(() => {
          NotificationService.dispatchNotify(t('admin:components.moderation.userBanned'), {
            variant: 'success'
          })
        })
        .catch((error) => {
          NotificationService.dispatchNotify(error.message, { variant: 'error' })
          console.error(error)
        })
    } else {
      moderationBanMutation
        .create({
          banUserId: report.reportedUserId,
          banned: true,
          banReason: report.abuseReason,
          reportedAt: report.reportedAt,
          ipAddress: report.ipAddress,
          reportedLocationId: report.reportedLocationId
        })
        .then((_value) => {
          NotificationService.dispatchNotify(t('admin:components.moderation.userBanned'), {
            variant: 'success'
          })
        })
        .catch((error) => {
          NotificationService.dispatchNotify(error.message, { variant: 'error' })
          console.error(error)
        })
    }
  }

  const usersQuery =
    report.type == 'Person'
      ? useFind(userPath, {
          query: {
            id: { $in: [report.reportedUserId, report.reportingUserId] },
            $limit: 2
          }
        })
      : useFind(userPath, {
          query: {
            id: { $in: [report.reportingUserId] },
            $limit: 1
          }
        })

  const reportAttachments = useFind(moderationAttachmentPath, {
    query: {
      moderationId: report.id
    }
  })
  const handleExport = () => {
    const headers = [
      t('admin:components.moderation.type'),
      t('admin:components.moderation.usernameBeingReported'),
      t('admin:components.moderation.uid'),
      t('admin:components.moderation.reporter'),
      t('admin:components.moderation.reason'),
      t('admin:components.moderation.status'),
      t('admin:components.moderation.dateReported'),
      t('admin:components.moderation.details')
    ]
    const rows = [
      [
        report.type,
        usersQuery.data.find((user) => user.id == report.reportedUserId)?.name,
        report.reportedUserId,
        usersQuery.data.find((user) => user.id == report.reportingUserId)?.name,
        report.abuseReason,
        report.status,
        `"${toDisplayDateTime(report.createdAt)}"`,
        report.reportDetails
      ]
    ]

    const csvContent = [
      headers.join(','), // Add headers
      ...rows.map((row) => row.join(',')) // Add rows
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', t('admin:components.moderation.reportCsvFilename'))
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (usersQuery.status !== 'success' && reportAttachments.status !== 'success') {
    return <LoadingView fullScreen className="block h-12 w-12" title={t('admin:components.moderation.loading')} />
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center">
        <button onClick={onBack} className="flex items-center">
          <IoArrowBack className="mr-2" />
        </button>
        <h2 className="ml-4">{t('admin:components.moderation.reportDetails')}</h2>
      </div>
      <div className="mb-4 rounded-lg p-4 text-white shadow" style={{ backgroundColor: '#0e0f11' }}>
        <div className="grid grid-cols-[30%_70%] gap-4">
          <div className="mb-4">
            <p className="text-[#a3a3a3]">{t('admin:components.moderation.id')}</p>
          </div>
          <div className="mb-4">
            <p>{report.id}</p>
          </div>
          <div className="mb-4">
            <p className="text-[#a3a3a3]">{t('admin:components.moderation.type')}</p>
          </div>
          <div className="mb-4">
            <p>{report.type == 'Location' ? t('admin:components.moderation.space') : report.type}</p>
          </div>
          {isPersonModeration && (
            <>
              <div className="mb-4">
                <p className="text-[#a3a3a3]">{t('admin:components.moderation.usernameBeingReported')}</p>
              </div>
              <div className="mb-4">
                <UserInfo userId={report.reportedUserId} usersQuery={usersQuery} />
              </div>
              <div className="mb-4">
                <p className="text-[#a3a3a3]">{t('admin:components.moderation.accountType')}</p>
              </div>
              <div className="mb-4">
                <p>
                  {locationAdminQuery && locationAdminQuery.status == 'success' && locationAdminQuery.data.length > 0
                    ? t('admin:components.moderation.owner')
                    : t('admin:components.moderation.user')}
                </p>
              </div>
            </>
          )}
          <div className="mb-4">
            <p className="text-[#a3a3a3]">{t('admin:components.moderation.reasonForAbuse')}</p>
          </div>
          <div className="mb-4">
            <p>{report.abuseReason}</p>
          </div>
          <div className="mb-4">
            <p className="text-[#a3a3a3]">{t('admin:components.moderation.dateReported')}</p>
          </div>
          <div className="mb-4">
            <p>{toDisplayDateTimeUtc(report?.reportedAt)} UTC</p>
          </div>
          <div className="mb-4">
            <p className="text-[#a3a3a3]">{t('admin:components.moderation.reporter')}</p>
          </div>
          <div className="mb-4">
            <UserInfo userId={report.reportingUserId} usersQuery={usersQuery} />
          </div>
          <div className="mb-4">
            <p className="text-[#a3a3a3]">{t('admin:components.moderation.space')}</p>
          </div>
          <div className="mb-4">
            <p>
              {report.reportedLocationId && <LocationLabel locationId={report.reportedLocationId} showUrl={true} />}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-[#a3a3a3]">{t('admin:components.moderation.ipAddress')}</p>
          </div>
          <div className="mb-4">
            <p>{report.ipAddress}</p>
          </div>
          <div className="mb-4">
            <p className="text-[#a3a3a3]">{t('admin:components.moderation.reportDetails')}</p>
          </div>
          <div className="mb-4">
            <p className="mr-4 rounded-lg p-4 font-medium text-gray-300" style={{ backgroundColor: '#191b1f' }}>
              {report?.reportDetails}
            </p>
          </div>
          <div className="mb-4">
            <p className="text-[#a3a3a3]">{t('admin:components.moderation.uploadedFiles')}</p>
          </div>
          <div className="mb-4">
            {reportAttachments.data.map((attachment) => (
              <p>
                <a
                  href={attachment.filePath}
                  className="cursor-pointer border-none bg-transparent px-0 py-0 text-blue-500 underline"
                  target="_blank"
                >
                  {attachment.fileName}
                </a>
              </p>
            ))}
          </div>
        </div>
        <div className="col-span-2 mt-4 flex justify-between">
          <Button onClick={handleExport} className="rounded bg-blue-500 px-4 py-2 text-sm text-white">
            {t('admin:components.moderation.exportReport')}
          </Button>
          <div className="flex space-x-4">
            <Button
              onClick={handleMarkAsHandled}
              disabled={report.status == 'Resolved'}
              variant="green"
              className="rounded bg-green-500 px-4 py-2 text-sm text-white disabled:text-white"
            >
              {t('admin:components.moderation.resolveIssue')}
            </Button>
            {isPersonModeration && !moderationBanQuery?.data[0]?.banned && (
              <Button variant="red" onClick={handleBanUser} className="rounded bg-red-500 px-4 py-2">
                {t('admin:components.moderation.banUser')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
