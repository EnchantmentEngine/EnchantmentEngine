import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMagnifyingGlass, HiPlus, HiTrash } from 'react-icons/hi2'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useMutation } from '@ir-engine/common'
import { channelPath, ChannelType } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button, Input } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

import AddEditChannelModal from './AddEditChannelModal'
import ChannelTable from './ChannelTable'

export default function Channels() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  const selectedChannels = useHookstate<ChannelType[]>([])
  const adminChannelRemove = useMutation(channelPath).remove

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  return (
    <>
      <div>
        <Text fontSize="xl" className="mb-6">
          {t('admin:components.channel.channels')}
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
            {selectedChannels.length > 0 && (
              <div>
                <Button
                  variant="red"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    ModalState.openModal(
                      <ConfirmDialog
                        text={t('admin:components.channel.confirmMultiChannelDelete')}
                        onSubmit={async () => {
                          await Promise.all(
                            selectedChannels.value.map((channel) => {
                              adminChannelRemove(channel.id)
                            })
                          )
                        }}
                      />
                    )
                  }}
                >
                  <HiTrash />
                  {t('admin:components.channel.removeChannels')}
                </Button>
              </div>
            )}
            <div className="ml-auto">
              <Button
                size="sm"
                fullWidth
                onClick={() => {
                  ModalState.openModal(<AddEditChannelModal />)
                }}
              >
                <HiPlus />
                {t('admin:components.channel.createChannel')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ChannelTable selectedChannels={selectedChannels} search={search.query.value} />
    </>
  )
}
