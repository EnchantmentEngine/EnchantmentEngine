import React from 'react'
import { useTranslation } from 'react-i18next'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useMutation } from '@ir-engine/common'
import { fileBrowserPath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { FileDataType } from '../../../constants/AssetTypes'

export default function DeleteFileModal({
  files,
  onComplete
}: {
  files: readonly FileDataType[]
  onComplete?: (err?: unknown) => void
}) {
  const { t } = useTranslation()
  const modalProcessing = useHookstate(false)
  const fileService = useMutation(fileBrowserPath)

  const handleSubmit = async () => {
    modalProcessing.set(true)
    try {
      await Promise.all(files.map((file) => fileService.remove(file.key)))
      modalProcessing.set(false)
      ModalState.closeModal()
      onComplete?.()
    } catch (err) {
      NotificationService.dispatchNotify(err?.message, { variant: 'error' })
      modalProcessing.set(false)
      onComplete?.(err)
    }
  }

  return (
    <Modal
      title={t('editor:layout.filebrowser.deleteFile')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={ModalState.closeModal}
      submitLoading={modalProcessing.value}
    >
      <Text className="w-full text-center">
        {files.length === 1
          ? t('editor:dialog.delete.confirm-content', { content: files[0].fullName })
          : t('editor:dialog.delete.confirm-multiple', {
              first: files[0].fullName,
              count: files.length - 1
            })}
      </Text>
    </Modal>
  )
}
