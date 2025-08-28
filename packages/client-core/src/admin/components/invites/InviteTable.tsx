import React from 'react'
import { useTranslation } from 'react-i18next'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useFind, useSearch } from '@ir-engine/common'
import { invitePath, InviteType, UserName } from '@ir-engine/common/src/schema.type.module'
import { isValidId } from '@ir-engine/common/src/utils/isValidId'
import { State } from '@ir-engine/hyperflux'
import { Checkbox } from '@ir-engine/ui'

import { Edit01Lg, Trash04Lg } from '@ir-engine/ui/src/icons'
import { inviteColumns, InviteRowType } from '../../common/constants/invite'
import DataTable from '../../common/Table'
import ActionButton from '../ActionButton'
import AddEditInviteModal from './AddEditInviteModal'
import RemoveInviteModal from './RemoveInviteModal'

export default function InviteTable({
  search,
  selectedInvites
}: {
  search: string
  selectedInvites: State<InviteType[]>
}) {
  const { t } = useTranslation()

  const adminInviteQuery = useFind(invitePath, {
    query: {
      $limit: 20,
      $sort: {
        id: 1
      }
    }
  })

  useSearch(
    adminInviteQuery,
    {
      $or: [
        {
          id: isValidId(search) ? search : undefined
        },
        {
          userId: isValidId(search) ? search : undefined
        },
        {
          inviteeId: isValidId(search) ? search : undefined
        },
        {
          inviteType: {
            $like: '%' + search + '%'
          }
        },
        {
          passcode: {
            $like: '%' + search + '%'
          }
        }
      ]
    },
    search
  )

  const createRows = (rows: readonly InviteType[]): InviteRowType[] =>
    rows.map((row) => ({
      select: (
        <Checkbox
          checked={selectedInvites.value.findIndex((invite) => invite.id === row.id) !== -1}
          onChange={(value) => {
            if (value) selectedInvites.merge([row])
            else selectedInvites.set((prevInvites) => prevInvites.filter((invite) => invite.id !== row.id))
          }}
        />
      ),
      id: row.id,
      name: row.invitee?.name || ((row.token || '') as UserName),
      passcode: row.passcode,
      type: row.inviteType,
      targetObjectId: row.targetObjectId,
      spawnType: row.spawnType,
      spawnDetails: row.spawnDetails ? JSON.stringify(row.spawnDetails) : '',
      action: (
        <div className="flex items-center gap-3">
          <ActionButton icon={Edit01Lg} onClick={() => ModalState.openModal(<AddEditInviteModal invite={row} />)} />

          <ActionButton
            icon={Trash04Lg}
            title={t('admin:components.common.delete')}
            onClick={() => ModalState.openModal(<RemoveInviteModal invites={[row]} />)}
            variant="red"
          />
        </div>
      )
    }))

  return (
    <DataTable
      size="xl"
      query={adminInviteQuery}
      columns={[
        {
          id: 'select',
          label: (
            <Checkbox
              checked={selectedInvites.length === adminInviteQuery.data.length}
              onChange={(value) => {
                if (value) selectedInvites.set(adminInviteQuery.data.slice())
                else selectedInvites.set([])
              }}
            />
          )
        },
        ...inviteColumns
      ]}
      rows={createRows(adminInviteQuery.data)}
    />
  )
}
