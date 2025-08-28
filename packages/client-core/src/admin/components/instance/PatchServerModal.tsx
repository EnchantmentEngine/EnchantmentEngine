import React from 'react'
import { useTranslation } from 'react-i18next'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useFind, useMutation } from '@ir-engine/common'
import { LocationID, locationPath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Input, Select } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'

import { NotificationService } from '../../../common/services/NotificationService'

export default function PatchServerModal() {
  const { t } = useTranslation()
  const state = useHookstate({
    locationId: '',
    locationError: '',
    count: 1
  })
  const modalProcessing = useHookstate(false)

  const handleSubmit = () => {
    modalProcessing.set(true)
    patchInstanceserver({ locationId: state.locationId.value as LocationID, count: state.count.value })
      .then((patchResponse) => {
        NotificationService.dispatchNotify(patchResponse.message, {
          variant: patchResponse.status ? 'success' : 'error'
        })
        ModalState.closeModal()
      })
      .catch((e) => {
        state.locationError.set(e.message)
      })
  }

  const adminLocations = useFind(locationPath, { query: { action: 'admin' } })
  const patchInstanceserver = useMutation('instanceserver-provision').patch

  const locationsMenu = adminLocations.data.map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  return (
    <Modal
      title={t('admin:components.setting.patchInstanceserver')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={ModalState.closeModal}
      submitLoading={modalProcessing.value}
    >
      <Select
        options={locationsMenu}
        value={state.locationId.value}
        onChange={(value: string) => {
          state.locationId.set(value)
        }}
        labelProps={{
          text: t('admin:components.instance.location'),
          position: 'top'
        }}
      />
      <Input
        type="number"
        value={state.count.value}
        onChange={(e) => {
          state.count.set(parseInt(e.target.value))
        }}
        labelProps={{
          text: t('admin:components.instance.count'),
          position: 'top'
        }}
        fullWidth
      />
    </Modal>
  )
}
