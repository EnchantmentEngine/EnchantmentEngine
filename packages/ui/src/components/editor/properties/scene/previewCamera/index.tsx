import { debounce } from 'lodash-es'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineCamera } from 'react-icons/hi'

import { getComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SceneThumbnailState } from '@ir-engine/editor/src/services/SceneThumbnailState'
import { ScenePreviewCameraComponent } from '@ir-engine/engine/src/scene/components/ScenePreviewCamera'
import { getState, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { ImageLink } from '@ir-engine/ui/editor'
import { Euler } from 'three'
import Button from '../../../../../primitives/tailwind/Button'

/**
 * ScenePreviewCameraNodeEditor provides the editor view to customize properties.
 */

export const ScenePreviewCameraNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const transformComponent = useComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent)
  const sceneThumnailState = useMutableState(SceneThumbnailState)
  const onSetFromViewport = () => {
    const { position, rotation } = getComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent)
    const scenePreviewCamera = getComponent(props.entity, ScenePreviewCameraComponent)
    setComponent(props.entity, TransformComponent, { position: position, rotation: rotation })
    scenePreviewCamera.camera.position.copy(position)
    scenePreviewCamera.camera.rotation.copy(new Euler().setFromQuaternion(rotation))
    TransformComponent.computeTransformMatrix(props.entity)
  }

  const updateScenePreview = async () => {
    await SceneThumbnailState.createThumbnail(512 / 2, 320 / 2, 1)
  }

  const updateCubeMapBakeDebounced = useCallback(debounce(updateScenePreview, 500), []) //ms

  useEffect(() => {
    updateCubeMapBakeDebounced()
    return () => {
      updateCubeMapBakeDebounced.cancel()
    }
  }, [transformComponent.position])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.sceneCamera.name')}
      description={t('editor:properties.sceneCamera.description')}
      Icon={ScenePreviewCameraNodeEditor.iconComponent}
    >
      <ImageLink src={sceneThumnailState.thumbnailURL.value ?? undefined} />
      <div className="my-4 flex h-auto flex-row items-center justify-center space-x-4">
        <Button
          onClick={() => {
            onSetFromViewport()
            updateScenePreview()
          }}
        >
          {t('editor:properties.sceneCamera.lbl-setFromViewPort')}
        </Button>

        <Button
          onClick={() => {
            SceneThumbnailState.uploadThumbnail()
          }}
          disabled={sceneThumnailState.thumbnail.value === undefined}
        >
          {t('editor:properties.sceneCamera.lbl-updateThumbnail')}
        </Button>
      </div>
    </NodeEditor>
  )
}

ScenePreviewCameraNodeEditor.iconComponent = HiOutlineCamera

export default ScenePreviewCameraNodeEditor
