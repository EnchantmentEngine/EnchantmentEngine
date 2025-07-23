import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMagnifyingGlass } from 'react-icons/hi2'

import { useMutation } from '@ir-engine/common'
import { userPath, UserType } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button, Input } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

import { ModalState } from '../../../common/services/ModalState'
import UserTable, { deactivateUsers } from './UserTable'

export default function Users() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const skipGuests = useHookstate(false)
  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  const selectedUsers = useHookstate<UserType[]>([])

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  const adminUserRemove = useMutation(userPath).patch
  const modalProcessing = useHookstate(false)

  return (
    <>
      <div>
        <Text fontSize="xl" className="mb-6">
          {t('admin:components.user.users')}
        </Text>
        <div className="mb-4 flex justify-between">
          <Input
            placeholder={t('common:components.search')}
            value={search.local.value}
            onChange={(event) => {
              search.local.set(event.target.value)

              if (debouncedSearchQueryRef) {
                clearTimeout(debouncedSearchQueryRef.current)
              }

              debouncedSearchQueryRef.current = setTimeout(() => {
                search.query.set(event.target.value)
              }, 100)
            }}
            startComponent={<HiMagnifyingGlass />}
          />
          {selectedUsers.length > 0 && (
            <Button
              variant="red"
              size="sm"
              onClick={() => {
                ModalState.openModal(
                  <ConfirmDialog
                    text={t('admin:components.user.confirmMultiUserDelete')}
                    onSubmit={async () => {
                      deactivateUsers(modalProcessing, adminUserRemove, selectedUsers.value as UserType[])
                    }}
                  />
                )
              }}
            >
              {t('admin:components.user.removeUsers')}
            </Button>
          )}
        </div>
      </div>
      <UserTable skipGuests={skipGuests.value} search={search.query.value} selectedUsers={selectedUsers} />
    </>
  )
}
