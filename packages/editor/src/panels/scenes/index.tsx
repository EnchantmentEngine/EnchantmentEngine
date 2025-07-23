import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { useFind, useRealtime } from '@ir-engine/common'
import { StaticResourceType, fileBrowserPath, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { confirmSceneSaveIfModified } from '@ir-engine/editor/src/components/toolbar/Toolbar'
import { onNewScene } from '@ir-engine/editor/src/functions/sceneFunctions'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { Button } from '@ir-engine/ui'
import { AddScene } from '@ir-engine/ui/src/components/editor/AddScene/AddScene'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { PlusCircleSm } from '@ir-engine/ui/src/icons'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import { TabData } from 'rc-dock'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { UIAddonsState } from '../../services/UIAddonsState'
import SceneItem from './SceneItem'

function ScenesPanel() {
  const { t } = useTranslation()
  const editorState = useMutableState(EditorState)
  const scenesQuery = useFind(staticResourcePath, {
    query: { project: editorState.projectName.value, type: 'scene', paginate: false }
  })
  const scenes = scenesQuery.data

  const scenesLoading = scenesQuery.status === 'pending'

  const onClickScene = async (scene: StaticResourceType) => {
    if (!(await confirmSceneSaveIfModified())) return

    getMutableState(EditorState).merge({
      scenePath: scene.key
    })
  }

  useRealtime(fileBrowserPath, scenesQuery.refetch)

  const isCreatingScene = useHookstate(false)
  const handleCreateScene = async () => {
    isCreatingScene.set(true)
    const newSceneUIAddons = getState(UIAddonsState).editor.newScene
    if (Object.keys(newSceneUIAddons).length > 0) {
      const { projectName } = getState(EditorState)
      ModalState.openModal(<AddScene projectName={projectName!} />)
    } else {
      await onNewScene()
    }
    isCreatingScene.set(false)
  }

  return (
    <div className="h-full bg-surface-1">
      <div className="mb-4 w-full overflow-hidden bg-surface-4 p-1">
        <Button
          disabled={isCreatingScene.value}
          className="ml-auto h-8  px-2"
          size="sm"
          data-testid="scene-panel-add-scene-button"
          onClick={handleCreateScene}
          variant="tertiary"
        >
          <PlusCircleSm />
          <span className="text-nowrap">{t('editor:newScene')}</span>
          {isCreatingScene.value && <LoadingView spinnerOnly className="h-4 w-4" />}
        </Button>
      </div>
      <div className="h-full bg-surface-1">
        {scenesLoading ? (
          <LoadingView title={t('editor:loadingScenes')} fullSpace className="block h-12 w-12" />
        ) : (
          <div className="relative h-full flex-1 overflow-y-auto px-4 py-3 pb-16">
            <div className="flex flex-wrap gap-4 pb-8" data-testid="scene-panel-scene-browser">
              {scenes.map((scene) => (
                <SceneItem
                  key={scene.id}
                  scene={scene}
                  onDeleteScene={() => {
                    if (editorState.sceneAssetID.value === scene.id) {
                      editorState.sceneName.set(null)
                      editorState.sceneAssetID.set(null)
                    }
                  }}
                  disableDeleteScene={editorState.sceneAssetID.value === scene.id}
                  onRenameScene={(newName) => {
                    if (editorState.sceneAssetID.value === scene.id) {
                      editorState.scenePath.set(newName)
                    }
                  }}
                  handleOpenScene={() => onClickScene(scene)}
                  refetchProjectsData={scenesQuery.refetch}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ScenePanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer dataTestId="scene-panel-tab">
        <PanelTitle>{t('editor:properties.scene.name')}</PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const ScenePanelTab: TabData = {
  id: 'scenePanel',
  closable: true,
  cached: true,
  title: <ScenePanelTitle />,
  content: <ScenesPanel />
}
