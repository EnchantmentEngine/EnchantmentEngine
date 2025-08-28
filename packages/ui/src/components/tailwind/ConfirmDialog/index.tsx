import { t } from 'i18next'
import React from 'react'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useHookstate } from '@ir-engine/hyperflux'

import Modal, { ModalProps } from '../../../primitives/tailwind/Modal'
import Text from '../../../primitives/tailwind/Text'

interface ConfirmDialogProps {
  title?: string
  text: string
  onSubmit: () => Promise<void> | void
  onClose?: () => void
  modalProps?: Partial<ModalProps>
}

export const ConfirmDialog = ({ title, text, onSubmit, onClose, modalProps }: ConfirmDialogProps) => {
  const errorText = useHookstate('')
  const modalProcessing = useHookstate(false)

  const handled = async () => {
    modalProcessing.set(true)
    try {
      await onSubmit()
      ModalState.closeModal()
    } catch (error) {
      errorText.set(error.message)
    }
    modalProcessing.set(false)
  }

  return (
    <Modal
      title={title || t('admin:components.common.confirmation')}
      onSubmit={handled}
      onClose={() => {
        ModalState.closeModal()
        onClose?.()
      }}
      className="h-[90dvh] w-[50vw] min-w-[720px] max-w-2xl xsh:h-auto xsh:min-w-fit"
      submitLoading={modalProcessing.value}
      rawChildren={
        <div
          className="flex h-[calc(90dvh-4rem-4.5rem)] flex-col items-center justify-center gap-2 xsh:h-auto xsh:py-2"
          data-testid="confirm-dialog"
        >
          <Text className="text-text-secondary" data-testid="confirm-dialog-text-element">
            {text}
          </Text>
          {errorText.value && (
            <Text className="text-red-700	" data-testid="confirm-dialog-error-text-element">
              {errorText.value}
            </Text>
          )}
        </div>
      }
      {...modalProps}
    ></Modal>
  )
}

export default ConfirmDialog
