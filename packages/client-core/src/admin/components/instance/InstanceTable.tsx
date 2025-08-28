import { useFind, useMutation, useSearch } from '@ir-engine/common'
import { InstanceType, instancePath } from '@ir-engine/common/src/schema.type.module'
import { isValidId } from '@ir-engine/common/src/utils/isValidId'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import { EyeLg, Trash04Lg } from '@ir-engine/ui/src/icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ModalState } from '../../../common/services/ModalState'
import DataTable from '../../common/Table'
import { instanceColumns } from '../../common/constants/instance'
import ActionButton from '../ActionButton'
import ViewModal from './ViewModal'

export default function InstanceTable({ search }: { search: string }) {
  const { t } = useTranslation()
  const instancesQuery = useFind(instancePath, {
    query: {
      $sort: { createdAt: 1 },
      $limit: 20,
      action: 'admin'
    }
  })

  useSearch(
    instancesQuery,
    {
      $or: [
        {
          id: isValidId(search) ? search : undefined
        },
        {
          locationId: isValidId(search) ? search : undefined
        },
        {
          channelId: isValidId(search) ? search : undefined
        }
      ]
    },
    search
  )

  const removeInstance = useMutation(instancePath).remove

  const createRows = (rows: readonly InstanceType[]) =>
    rows.map((row) => ({
      id: row.id,
      ipAddress: row.ipAddress,
      currentUsers: row.currentUsers,
      locationName: row.location && row.location.name ? row.location.name : '',
      channelId: row.channelId,
      podName: row.podName,
      action: (
        <div className="flex items-center justify-start gap-3 px-2 py-1">
          <ActionButton
            icon={EyeLg}
            onClick={() => {
              ModalState.openModal(<ViewModal instanceId={row.id} />)
            }}
          />

          <ActionButton
            icon={Trash04Lg}
            onClick={() => {
              ModalState.openModal(
                <ConfirmDialog
                  text={`${t('admin:components.instance.confirmInstanceDelete')} (${row.id}) ?`}
                  onSubmit={async () => {
                    await removeInstance(row.id)
                  }}
                />
              )
            }}
            variant="red"
          />
        </div>
      )
    }))

  return <DataTable size="xl" query={instancesQuery} columns={instanceColumns} rows={createRows(instancesQuery.data)} />
}
