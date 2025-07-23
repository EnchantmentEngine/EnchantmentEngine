import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import isValidSceneName from '@ir-engine/common/src/utils/validateSceneName'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { AssetModifiedState } from '@ir-engine/engine/src/gltf/GLTFState'
import { getMutableState, getState, none, useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import ErrorDialog from '@ir-engine/ui/src/components/tailwind/ErrorDialog'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { saveSceneGLTF } from '../../functions/sceneFunctions'
import { EditorState } from '../../services/EditorServices'

export default function SaveNewSceneDialog(props: { onConfirm?: () => void; onCancel?: () => void }) {
  const { t } = useTranslation()
  const inputSceneName = useHookstate('New-Scene')
  const modalProcessing = useHookstate(false)
  const inputError = useHookstate('')

  const handleSubmit = async () => {
    if (!isValidSceneName(inputSceneName.value)) {
      inputError.set(t('editor:errors.invalidSceneName'))
      return
    }

    modalProcessing.set(true)
    const { projectName, sceneName, rootEntity, sceneAssetID } = getState(EditorState)
    const sceneModified = EditorState.isModified()
    const abortController = new AbortController()
    try {
      if (sceneName || sceneModified) {
        if (inputSceneName.value && projectName) {
          await saveSceneGLTF(sceneAssetID!, projectName, `${inputSceneName.value}.gltf`, abortController.signal, true)

          const sourceID = GLTFComponent.getSourceID(rootEntity)
          getMutableState(AssetModifiedState)[sourceID].set(none)
        }
      }
      ModalState.closeModal()
      if (props.onConfirm) props.onConfirm()
    } catch (error) {
      ModalState.closeModal()
      if (props.onCancel) props.onCancel()
      console.error(error)
      ModalState.openModal(
        <ErrorDialog title={t('editor:savingError')} description={error?.message || t('editor:savingErrorMsg')} />
      )
    }
    modalProcessing.set(false)
  }

  return (
    <Modal
      title={t('editor:dialog.saveNewScene.title')}
      onClose={() => {
        ModalState.closeModal()
        if (props.onCancel) props.onCancel()
      }}
      onSubmit={handleSubmit}
      className="w-[50vw] max-w-2xl"
      submitLoading={modalProcessing.value}
      submitButtonDisabled={inputError.value.length > 0}
    >
      <Input
        value={inputSceneName.value}
        onChange={(event) => {
          inputError.set('')
          inputSceneName.set(event.target.value)
        }}
        labelProps={{
          text: t('editor:dialog.saveNewScene.lbl-name'),
          position: 'top'
        }}
        state={inputError.value ? 'error' : undefined}
        helperText={inputError.value}
      />
    </Modal>
  )
}
