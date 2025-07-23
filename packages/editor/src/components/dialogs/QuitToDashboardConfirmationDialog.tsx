import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { Button } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { onSaveScene } from '../../functions/sceneFunctions'

export default function QuitToDashboardConfirmationDialog({ resolve }: { resolve: (value: unknown) => void }) {
  const { t } = useTranslation()

  const onClose = (quit: boolean) => {
    resolve(quit)
    ModalState.closeModal()
  }
  return (
    <Modal
      title={t('editor:dialog.saveScene.unsavedChanges.title')}
      className="w-[50vw] max-w-xl"
      hideFooter={true}
      onClose={() => {
        resolve(false)
        ModalState.closeModal()
      }}
      rawChildren={
        <>
          <div className="py-6 text-center">
            <span>{t('editor:dialog.saveScene.info-question')}</span>
            <p className="text-xs text-red-600">{t('editor:dialog.saveScene.info-warning')}</p>
          </div>
          <div className="grid grid-flow-col border-t px-5 py-6">
            <Button variant="tertiary" onClick={() => onClose(true)}>
              {t('editor:dialog.saveScene.discard-quit')}
            </Button>
            <div className="flex flex-1 place-content-end gap-2">
              <Button variant="secondary" onClick={() => onClose(false)}>
                {t('common:components.cancel')}
              </Button>
              <Button
                onClick={async () => {
                  await onSaveScene()
                  resolve(true)
                }}
              >
                {t('editor:dialog.saveScene.lbl-save-quit')}
              </Button>
            </div>
          </div>
        </>
      }
    />
  )
}
