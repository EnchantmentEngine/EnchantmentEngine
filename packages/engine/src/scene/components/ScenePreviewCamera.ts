import { useLayoutEffect } from 'react'
import { PerspectiveCamera } from 'three'

import { EngineState, useEntityContext, useExecute } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { getMutableState, getState, isClient, Schema, useHookstate } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { TransformDirtyCleanupSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'

export const ScenePreviewCameraComponent = defineComponent({
  name: 'EE_scenePreviewCamera',
  jsonID: 'EE_scene_preview_camera',

  schema: Schema.Object({
    camera: Schema.Class(() => new PerspectiveCamera(80, 16 / 9, 0.2, 8000), { serialized: false })
  }),

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const previewCamera = useComponent(entity, ScenePreviewCameraComponent)
    const previewCameraTransform = useComponent(entity, TransformComponent)
    const engineCameraTransform = useOptionalComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent)
    const isEditing = useHookstate(getMutableState(EngineState).isEditing).value

    useLayoutEffect(() => {
      if (!engineCameraTransform || isEditing) return

      const transform = getComponent(entity, TransformComponent)
      const cameraTransform = getComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent)
      cameraTransform.position.copy(transform.position)
      cameraTransform.rotation.copy(transform.rotation)
      const camera = previewCamera.camera
      setComponent(entity, ObjectComponent, camera)

      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [engineCameraTransform])

    useExecute(
      () => {
        if (!TransformComponent.dirty[entity]) return
        const camera = getComponent(entity, ScenePreviewCameraComponent).camera
        camera.matrixWorldInverse.copy(camera.matrixWorld).invert()
      },
      { before: TransformDirtyCleanupSystem }
    )

    useLayoutEffect(() => {
      if (!engineCameraTransform) return
      previewCamera.camera.position.copy(previewCameraTransform.position)
      previewCamera.camera.quaternion.copy(previewCameraTransform.rotation)
    }, [previewCameraTransform])

    return null
  }
})
