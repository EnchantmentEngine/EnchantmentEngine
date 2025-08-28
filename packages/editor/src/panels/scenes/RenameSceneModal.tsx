import React from 'react'
import { useTranslation } from 'react-i18next'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'

import { renameScene } from '@ir-engine/client-core/src/world/SceneAPI'
import { StaticResourceType } from '@ir-engine/common/src/schema.type.module'
import isValidSceneName from '@ir-engine/common/src/utils/validateSceneName'
import { useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'

type Props = {
  sceneName: string
  scene: StaticResourceType
  onRenameScene?: (newName: string) => void
  refetchProjectsData: () => void
}

export default function RenameSceneModal({ sceneName, onRenameScene, scene, refetchProjectsData }: Props) {
  const { t } = useTranslation()
  const newSceneName = useHookstate(sceneName)
  const inputError = useHookstate('')

  const handleSubmit = async () => {
    if (!isValidSceneName(newSceneName.value)) {
      inputError.set(t('editor:errors.invalidSceneName'))
      return
    }
    const currentURL = scene.key
    const newURL = currentURL.replace(currentURL.split('/').pop()!, newSceneName.value + '.gltf')
    const newData = await renameScene(scene, newURL, scene.project!)
    refetchProjectsData()

    if (onRenameScene) {
      onRenameScene(newData[0].key)
    }

    ModalState.closeModal()
  }

  return (
    <Modal
      title={t('editor:hierarchy.lbl-renameScene')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={ModalState.closeModal}
      submitButtonDisabled={newSceneName.value === sceneName || inputError.value.length > 0}
    >
      <Input
        value={newSceneName.value}
        onChange={(event) => {
          inputError.set('')
          newSceneName.set(event.target.value)
        }}
        state={inputError.value ? 'error' : undefined}
        helperText={inputError.value}
        data-testid="scene-panel-scene-rename-input"
        fullWidth
      />

      <p className="mt-2 text-xs text-text-secondary">
        Scene name must be 4–64 characters, start and end with a letter or number, and may include letters, numbers,
        spaces, underscores, hyphens, and periods.
      </p>
    </Modal>
  )
}
