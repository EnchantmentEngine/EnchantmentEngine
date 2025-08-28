import React from 'react'
import { useTranslation } from 'react-i18next'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useMutation } from '@ir-engine/common'
import { channelPath, ChannelType } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'

const getDefaultErrors = () => ({
  channelName: '',
  serverError: ''
})

export default function AddEditChannelModal({ channel }: { channel?: ChannelType }) {
  const { t } = useTranslation()

  const channelName = useHookstate(channel?.name || '')
  const channelMutation = useMutation(channelPath)

  const submitLoading = useHookstate(false)
  const errors = useHookstate(getDefaultErrors())

  const handleSubmit = async () => {
    errors.set(getDefaultErrors())

    if (!channelName.value) {
      errors.channelName.set(t('admin:components.channel.nameRequired'))
      return
    }

    try {
      if (channel?.id) {
        channelMutation.patch(channel.id, { name: channelName.value })
      } else {
        channelMutation.create({ name: channelName.value })
      }
      ModalState.closeModal()
    } catch (err) {
      errors.serverError.set(err.message)
    }
  }

  return (
    <Modal
      title={channel?.id ? t('admin:components.channel.update') : t('admin:components.channel.createChannel')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={ModalState.closeModal}
      submitLoading={submitLoading.value}
    >
      {errors.serverError.value && <p className="mb-3 text-red-700">{errors.serverError.value}</p>}
      <Input
        fullWidth
        labelProps={{
          text: t('admin:components.channel.name'),
          position: 'top'
        }}
        value={channelName.value}
        onChange={(event) => channelName.set(event.target.value)}
        helperText={errors.channelName.value}
        state={errors.channelName.value ? 'error' : undefined}
      />
    </Modal>
  )
}
