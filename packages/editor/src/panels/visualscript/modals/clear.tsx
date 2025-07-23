import React from 'react'
import { useTranslation } from 'react-i18next'
import { useReactFlow } from 'reactflow'
import { Modal } from '.'

export type ClearModalProps = {
  open?: boolean
  onClose: () => void
}

export const ClearModal: React.FC<ClearModalProps> = ({ open = false, onClose }) => {
  const instance = useReactFlow()
  const { t } = useTranslation()

  const handleClear = () => {
    instance.setNodes([])
    instance.setEdges([])
    // TODO better way to call fit vew after edges render
    setTimeout(() => {
      instance.fitView()
    }, 100)
    onClose()
  }

  return (
    <Modal
      title={t('editor:visualScript.modal.clear.title')}
      actions={[
        { label: t('editor:visualScript.modal.buttons.cancel'), onClick: onClose },
        { label: t('editor:visualScript.modal.buttons.clear'), onClick: handleClear }
      ]}
      open={open}
      onClose={onClose}
    >
      <p>{t('editor:visualScript.modal.clear.confirm')}</p>
    </Modal>
  )
}
