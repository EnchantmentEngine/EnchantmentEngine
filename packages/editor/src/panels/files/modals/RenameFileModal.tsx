import React from 'react'
import { useTranslation } from 'react-i18next'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useMutation } from '@ir-engine/common'
import { fileBrowserPath } from '@ir-engine/common/src/schema.type.module'
import { isValidFileName } from '@ir-engine/common/src/utils/validateFileName'
import { useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import { FileDataType } from '../../../constants/AssetTypes'

export default function RenameFileModal({ projectName, file }: { projectName: string; file: FileDataType }) {
  const { t } = useTranslation()
  const newFileName = useHookstate(file.name)
  const fileService = useMutation(fileBrowserPath)
  const resultFileName = isValidFileName(newFileName.value)

  const handleSubmit = async () => {
    if (resultFileName.isValid) {
      fileService.update(null, {
        oldProject: projectName,
        newProject: projectName,
        oldName: file.fullName,
        newName: file.isFolder ? newFileName.value : `${newFileName.value}.${file.type}`,
        oldPath: file.path,
        newPath: file.path,
        isCopy: false
      })
    }
    ModalState.closeModal()
  }

  return (
    <Modal
      title={t('editor:layout.filebrowser.renameFile')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={ModalState.closeModal}
      submitButtonDisabled={!resultFileName.isValid}
    >
      <Input
        value={newFileName.value}
        data-testid="rename-file-input"
        onChange={(event) => newFileName.set(event.target.value)}
        state={!resultFileName.isValid ? 'error' : undefined}
        helperText={!resultFileName.isValid ? resultFileName.error : undefined}
      />
    </Modal>
  )
}
