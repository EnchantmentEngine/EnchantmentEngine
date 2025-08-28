import React from 'react'
import { useTranslation } from 'react-i18next'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useFind, useMutation, useSearch } from '@ir-engine/common'
import { channelPath, ChannelType } from '@ir-engine/common/src/schema.type.module'
import { isValidId } from '@ir-engine/common/src/utils/isValidId'
import { State } from '@ir-engine/hyperflux'
import { Checkbox } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import { Edit01Lg, Trash04Lg } from '@ir-engine/ui/src/icons'
import { channelColumns, ChannelRowType } from '../../common/constants/channel'
import DataTable from '../../common/Table'
import ActionButton from '../ActionButton'
import AddEditChannelModal from './AddEditChannelModal'

export default function ChannelTable({
  search,
  selectedChannels
}: {
  search: string
  selectedChannels: State<ChannelType[]>
}) {
  const { t } = useTranslation()

  const adminChannelsQuery = useFind(channelPath, {
    query: {
      action: 'admin',
      $limit: 20,
      $sort: {
        name: 1
      }
    }
  })
  const adminChannelRemove = useMutation(channelPath).remove

  useSearch(
    adminChannelsQuery,
    {
      $or: [
        {
          id: isValidId(search) ? search : undefined
        },
        {
          name: {
            $like: `%${search}%`
          }
        }
      ]
    },
    search
  )

  const createRows = (rows: readonly ChannelType[]): ChannelRowType[] =>
    rows.map((row) => ({
      select: (
        <Checkbox
          checked={selectedChannels.value.findIndex((invite) => invite.id === row.id) !== -1}
          onChange={(value) => {
            if (value) selectedChannels.merge([row])
            else selectedChannels.set((prevInvites) => prevInvites.filter((invite) => invite.id !== row.id))
          }}
        />
      ),
      id: row.id,
      name: row.name,
      action: (
        <div className="flex items-center justify-start gap-3">
          <ActionButton
            icon={Edit01Lg}
            title={t('admin:components.common.view')}
            onClick={() => ModalState.openModal(<AddEditChannelModal channel={row} />)}
            variant="green"
          />

          <ActionButton
            icon={Trash04Lg}
            title={t('admin:components.common.delete')}
            onClick={() =>
              ModalState.openModal(
                <ConfirmDialog
                  text={`${t('admin:components.channel.confirmChannelDelete')} '${row.name}'?`}
                  onSubmit={async () => {
                    adminChannelRemove(row.id)
                  }}
                />
              )
            }
            variant="red"
          />
        </div>
      )
    }))

  return (
    <DataTable
      size="xl"
      query={adminChannelsQuery}
      columns={[
        {
          id: 'select',
          label: (
            <Checkbox
              checked={selectedChannels.length === adminChannelsQuery.data.length}
              onChange={(value) => {
                if (value) selectedChannels.set(adminChannelsQuery.data.slice())
                else selectedChannels.set([])
              }}
            />
          )
        },
        ...channelColumns
      ]}
      rows={createRows(adminChannelsQuery.data)}
    />
  )
}
