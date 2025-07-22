import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
export default function PrefabConfirmationPanelDialog() {
  const { t } = useTranslation()

  return (
    <Modal
      title={t('editor:properties.prefab.lbl-confimation')}
      className="w-[50vw] max-w-2xl"
      onClose={ModalState.closeModal}
      closeButtonText="OK"
    ></Modal>
  )
}
