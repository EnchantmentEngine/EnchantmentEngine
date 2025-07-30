import { useEffect } from 'react'

import {
  EntityTreeComponent,
  createEntity,
  defineComponent,
  removeEntityNodeRecursively,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraGizmoTagComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { Object3D } from 'three'
import { cameraGizmo, cameraPicker, setupGizmo } from '../../../constants/GizmoPresets'

export const CameraGizmoVisualComponent = defineComponent({
  name: 'CameraGizmoVisual',

  schema: S.Object({
    sceneEntity: S.Entity(),
    gizmo: S.Entity(),
    picker: S.Entity()
  }),

  reactor: function () {
    const cameraGizmoVisualEntity = useEntityContext()
    const visualComponent = useComponent(cameraGizmoVisualEntity, CameraGizmoVisualComponent)

    useEffect(() => {
      const gizmo = createEntity()
      const picker = createEntity()
      setComponent(gizmo, ObjectComponent, new Object3D())
      setComponent(gizmo, NameComponent, `cameraGizmoMeshEntity`)
      setComponent(gizmo, CameraGizmoTagComponent)
      setComponent(gizmo, VisibleComponent)
      setComponent(gizmo, EntityTreeComponent, {
        parentEntity: visualComponent.sceneEntity ?? getState(ReferenceSpaceState).originEntity
      })
      setupGizmo(gizmo, cameraGizmo, ObjectLayers.Scene)

      setComponent(cameraGizmoVisualEntity, CameraGizmoVisualComponent, { gizmo })

      setComponent(picker, ObjectComponent, new Object3D())
      setComponent(picker, NameComponent, `cameraGizmoPickerMeshEntity`)
      setComponent(picker, CameraGizmoTagComponent)
      setComponent(picker, VisibleComponent)
      setComponent(picker, EntityTreeComponent, {
        parentEntity: visualComponent.sceneEntity ?? getState(ReferenceSpaceState).originEntity
      })
      setupGizmo(picker, cameraPicker, ObjectLayers.Scene)

      setComponent(cameraGizmoVisualEntity, CameraGizmoVisualComponent, { picker })

      setComponent(picker, InputComponent)

      return () => {
        removeEntityNodeRecursively(gizmo)
        removeEntityNodeRecursively(picker)
      }
    }, [])

    return null
  }
})
