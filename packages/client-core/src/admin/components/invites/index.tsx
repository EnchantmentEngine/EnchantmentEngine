import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMagnifyingGlass, HiPlus } from 'react-icons/hi2'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { InviteType } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button, Input } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

import AddEditInviteModal from './AddEditInviteModal'
import InviteTable from './InviteTable'
import RemoveInviteModal from './RemoveInviteModal'

export default function Invites() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  const selectedInvites = useHookstate<InviteType[]>([])

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  return (
    <>
      <div>
        <Text fontSize="xl" className="mb-6">
          {t('admin:components.invite.invites')}
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
          <div className="flex gap-4">
            {selectedInvites.length > 0 && (
              <div>
                <Button
                  variant="red"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    ModalState.openModal(<RemoveInviteModal invites={selectedInvites.value as InviteType[]} />)
                  }}
                >
                  {t('admin:components.invite.removeInvites')}
                </Button>
              </div>
            )}
            <div className="ml-auto">
              <Button
                size="sm"
                fullWidth
                onClick={() => {
                  ModalState.openModal(<AddEditInviteModal />)
                }}
              >
                <HiPlus />
                {t('admin:components.invite.create')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <InviteTable selectedInvites={selectedInvites} search={search.query.value} />
    </>
  )
}
