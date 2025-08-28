import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiEye } from 'react-icons/hi2'

import { useFind } from '@ir-engine/common'
import { buildStatusPath, BuildStatusType } from '@ir-engine/common/src/schema.type.module'

import { Button } from '@ir-engine/ui'
import TruncatedText from '@ir-engine/ui/src/primitives/tailwind/TruncatedText'
import { ModalState } from '../../../../common/services/ModalState'
import { buildStatusColumns, BuildStatusRowType } from '../../../common/constants/build-status'
import DataTable from '../../../common/Table'
import BuildStatusLogsModal, { BuildStatusBadge, getStartOrEndDate } from './BuildStatusLogsModal'

export default function BuildStatusTable() {
  const { t } = useTranslation()

  const adminBuildStatusQuery = useFind(buildStatusPath, {
    query: {
      $limit: 10,
      $sort: {
        id: -1
      }
    }
  })

  const createRows = (rows: readonly BuildStatusType[]): BuildStatusRowType[] =>
    rows.map((row) => ({
      id: row.id.toString(),
      commitSHA: (
        <TruncatedText
          variant="copy"
          text={row.commitSHA || ''}
          truncatorChar=""
          visibleChars={8}
          truncatorPosition="end"
        />
      ),
      status: <BuildStatusBadge status={row.status} />,
      dateStarted: getStartOrEndDate(row.dateStarted),
      dateEnded: getStartOrEndDate(row.dateEnded, true),
      logs: (
        <Button
          size="sm"
          disabled={!row.logs || !row.logs.length}
          onClick={() => {
            ModalState.openModal(<BuildStatusLogsModal buildStatus={row} />)
          }}
        >
          <HiEye />
          {t('admin:components.buildStatus.viewLogs')}
        </Button>
      )
    }))

  return (
    <DataTable
      query={adminBuildStatusQuery}
      columns={buildStatusColumns}
      rows={createRows(adminBuildStatusQuery.data)}
    />
  )
}
