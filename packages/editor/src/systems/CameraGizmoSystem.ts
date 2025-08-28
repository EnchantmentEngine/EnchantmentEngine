import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { CameraGizmoComponent } from '../classes/gizmo/camera/CameraGizmoComponent'
import { cameraGizmoUpdate, controlUpdate } from '../functions/gizmos/cameraGizmoHelper'

export const cameraGizmoQuery = defineQuery([CameraGizmoComponent])

const execute = () => {
  for (const cameraGizmoEntity of cameraGizmoQuery()) {
    const cameraGizmoComponent = getComponent(cameraGizmoEntity, CameraGizmoComponent)
    if (!cameraGizmoComponent.enabled || !cameraGizmoComponent.visualEntity) return
    cameraGizmoUpdate(cameraGizmoEntity)
    controlUpdate(cameraGizmoEntity)
  }
}

export const CameraGizmoSystem = defineSystem({
  uuid: 'ee.editor.CameraGizmoSystem',
  insert: { with: AnimationSystemGroup },
  execute
})
