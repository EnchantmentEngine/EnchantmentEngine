import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { isValidFileName } from '@ir-engine/common/src/utils/validateFileName'
import { getComponent, hasComponent } from '@ir-engine/ecs'
import { STATIC_ASSET_REGEX } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { exportRelativeGLTF } from '../../functions/exportGLTF'
import { AssetsRefreshState } from '../../panels/assets/hooks'
import { FileRefreshState } from '../../panels/files/helpers'
import { EditorState } from '../../services/EditorServices'

export default function SavePrefabPanel({ entity }) {
  const { t } = useTranslation()
  if (!hasComponent(entity, GLTFComponent))
    throw new Error('Cannot save a prefab that has no GLTF Component on root entity')
  const gltfComponent = getComponent(entity, GLTFComponent)
  const srcPath = useHookstate(STATIC_ASSET_REGEX.exec(gltfComponent.src)?.[3].replace(/\.[^.]*$/, ''))
  const fileName = (srcPath.value ?? '').split('/').pop() ?? ''
  const resultFileName = useHookstate(isValidFileName(fileName))

  const onSavePrefab = async () => {
    const saveName = srcPath.value + '.gltf'
    await exportRelativeGLTF(entity, getState(EditorState).projectName!, saveName, false)
    AssetsRefreshState.triggerRefresh()
    FileRefreshState.triggerRefresh()

    ModalState.closeModal()
  }

  return (
    <Modal
      title={t('editor:dialog.savePrefab.title')}
      onSubmit={onSavePrefab}
      submitButtonDisabled={!resultFileName.isValid.value}
      className="w-[50vw] max-w-2xl"
      onClose={ModalState.closeModal}
    >
      <Input
        value={srcPath.value}
        onChange={(event) => {
          const fileName = (event.target.value ?? '').split('/').pop() ?? ''
          resultFileName.set(isValidFileName(fileName))
          srcPath.set(event.target.value)
        }}
        labelProps={{
          text: t('editor:dialog.savePrefab.lbl-save-path'),
          position: 'top'
        }}
        state={!resultFileName.value.isValid ? 'error' : undefined}
        helperText={!resultFileName.value.isValid ? resultFileName.value.error : undefined}
      />
    </Modal>
  )
}
