import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useFind, useMutation, useSearch } from '@ir-engine/common'
import { AvatarID, AvatarType, UserName, avatarPath } from '@ir-engine/common/src/schema.type.module'
import { isValidId } from '@ir-engine/common/src/utils/isValidId'
import { useHookstate } from '@ir-engine/hyperflux'
import { ConfirmDialog } from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import AvatarImage from '@ir-engine/ui/src/primitives/tailwind/AvatarImage'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Edit01Lg, Trash04Lg } from '@ir-engine/ui/src/icons'
import { truncateText } from '@ir-engine/ui/src/primitives/tailwind/TruncatedText'
import DataTable from '../../common/Table'
import { AvatarRowType, avatarColumns } from '../../common/constants/avatar'
import ActionButton from '../ActionButton'
import AddEditAvatarModal from './AddEditAvatarModal'

export default function AvatarTable({ search }: { search: string }) {
  const { t } = useTranslation()
  const adminAvatarQuery = useFind(avatarPath, {
    query: {
      action: 'admin',
      $limit: 20,
      $sort: {
        name: 1
      }
    }
  })
  const adminAvatarPatch = useMutation(avatarPath).patch

  useSearch(
    adminAvatarQuery,
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

  const IsPublicToggle = ({ id, isPublic }: { id: AvatarID; isPublic: boolean }) => {
    const disabled = useHookstate(false)
    return (
      <Toggle
        value={isPublic}
        onChange={(value) => {
          disabled.set(true)
          adminAvatarPatch(id, { isPublic: value })
            .then(() => adminAvatarQuery.refetch())
            .catch(() => disabled.set(false))
        }}
        disabled={disabled.value}
      />
    )
  }

  const adminAvatarRemove = useMutation(avatarPath).remove
  const errorText = useHookstate('')

  useEffect(() => {
    setTimeout(() => {
      errorText.set('I AM ERROR')
    }, 5000)
  }, [])

  const createRows = (rows: readonly AvatarType[]): AvatarRowType[] =>
    rows.map((row) => ({
      id: row.id,
      name: truncateText(row.name, { visibleChars: 16, truncatorPosition: 'end' }),
      user: (row.user?.name || '') as UserName,
      isPublic: <IsPublicToggle id={row.id} isPublic={row.isPublic} />,
      thumbnail: <AvatarImage src={row.thumbnailResource?.url + '?' + new Date().getTime()} className="mx-auto" />,
      action: (
        <div className="flex items-center justify-start gap-3">
          <ActionButton
            icon={Edit01Lg}
            title={t('admin:components.common.view')}
            onClick={() => ModalState.openModal(<AddEditAvatarModal avatar={row} />)}
            variant="green"
          />

          <ActionButton
            icon={Trash04Lg}
            title={t('admin:components.common.delete')}
            onClick={() => {
              ModalState.openModal(
                <ConfirmDialog
                  text={`${t('admin:components.avatar.confirmAvatarDelete')} '${row.name}'?`}
                  onSubmit={async () => {
                    await adminAvatarRemove(row.id)
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
    <DataTable size="xl" query={adminAvatarQuery} columns={avatarColumns} rows={createRows(adminAvatarQuery.data)} />
  )
}
