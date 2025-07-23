import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import React from 'react'
import Modal, { ModalProps } from '../../../primitives/tailwind/Modal'
import WarningView from '../../../primitives/tailwind/WarningView'

interface WarningDialogProps {
  title: string
  description?: string
  modalProps?: ModalProps
}

const WarningDialog = ({ title, description, modalProps }: WarningDialogProps) => {
  return (
    <Modal
      onClose={ModalState.closeModal}
      showCloseButton={false}
      submitButtonDisabled={true}
      onSubmit={() => ModalState.closeModal()}
      className="w-[50vw] max-w-2xl bg-yellow-600"
      hideFooter={true}
      {...modalProps}
    >
      <WarningView title={title} description={description} />
    </Modal>
  )
}

export default WarningDialog
