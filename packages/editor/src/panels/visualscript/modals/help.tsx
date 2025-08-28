import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '.'

export type HelpModalProps = {
  open?: boolean
  onClose: () => void
}

export const HelpModal: React.FC<HelpModalProps> = ({ open = false, onClose }) => {
  const { t } = useTranslation()

  return (
    <Modal
      title={t('editor:visualScript.modal.help.title')}
      actions={[{ label: t('editor:visualScript.modal.buttons.close'), onClick: onClose }]}
      open={open}
      onClose={onClose}
    >
      <p style={{ marginBottom: '0.5rem' }}>{t('editor:visualScript.modal.help.addNodeHelp')}</p>
      <p style={{ marginBottom: '0.5rem' }}>{t('editor:visualScript.modal.help.addConnectionHelp')}</p>
      <p style={{ marginBottom: '0.5rem' }}>{t('editor:visualScript.modal.help.deleteNodeHelp')}</p>
    </Modal>
  )
}
