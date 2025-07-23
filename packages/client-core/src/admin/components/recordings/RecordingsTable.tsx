import React from 'react'
import { useTranslation } from 'react-i18next'

import { useFind, useMutation, useSearch } from '@ir-engine/common'
import { RecordingType, recordingPath } from '@ir-engine/common/src/schema.type.module'
import { isValidId } from '@ir-engine/common/src/utils/isValidId'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import { Trash04Lg } from '@ir-engine/ui/src/icons'
import { ModalState } from '../../../common/services/ModalState'
import DataTable from '../../common/Table'
import { recordingColumns } from '../../common/constants/recordings'
import ActionButton from '../ActionButton'

export default function RecordingsTable({ search }: { search: string }) {
  const { t } = useTranslation()
  const recordingsQuery = useFind(recordingPath, {
    query: {
      $sort: { createdAt: 1 },
      $limit: 20,
      action: 'admin'
    }
  })

  useSearch(
    recordingsQuery,
    {
      $or: [
        {
          id: isValidId(search) ? search : undefined
        },
        {
          userId: isValidId(search) ? search : undefined
        }
      ]
    },
    search
  )

  const removeRecording = useMutation(recordingPath).remove

  const createRows = (rows: readonly RecordingType[]) =>
    rows.map((row) => ({
      id: row.id,
      user: row.userName,
      ended: row.ended ? t('admin:components.common.yes') : t('admin:components.common.no'),
      schema: JSON.stringify(row.schema),
      action: (
        <div className="flex w-full justify-center px-2 py-1">
          {/* <Button className=" h-8 w-8 justify-center border bg-transparent p-0" rounded>
            <HiEye className="place-self-center" />
          </Button> */}
          <ActionButton
            icon={Trash04Lg}
            title={t('admin:components.common.delete')}
            onClick={() => {
              ModalState.openModal(
                <ConfirmDialog
                  text={`${t('admin:components.recording.confirmRecordingDelete')} (${row.id}) ?`}
                  onSubmit={async () => {
                    await removeRecording(row.id)
                  }}
                />
              )
            }}
            variant="red"
          />
        </div>
      )
    }))

  return (
    <DataTable size="xl" query={recordingsQuery} columns={recordingColumns} rows={createRows(recordingsQuery.data)} />
  )
}
