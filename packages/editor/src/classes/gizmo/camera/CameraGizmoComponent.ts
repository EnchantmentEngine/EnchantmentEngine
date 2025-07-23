import { useEffect } from 'react'

import { EntityTreeComponent, createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'

import { UndefinedEntity } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getState, useImmediateEffect } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraGizmoTagComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { TransformAxis } from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { InputComponent, InputExecutionOrder } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import {
  onGizmoCommit,
  onPointerDown,
  onPointerHover,
  onPointerLost,
  onPointerUp
} from '../../../functions/gizmos/cameraGizmoHelper'
import { CameraGizmoVisualComponent } from './CameraGizmoVisualComponent'

// camera synced to the visual entity
export const CameraGizmoComponent = defineComponent({
  name: 'CameraGizmo',

  schema: S.Object({
    sceneEntity: S.Entity(),
    cameraEntity: S.Entity(),
    visualEntity: S.Entity(),
    enabled: S.Bool({ default: true }),
    axis: S.Union([S.Null(), S.LiteralUnion(Object.values(TransformAxis))]),
    showX: S.Bool({ default: true }),
    showY: S.Bool({ default: true }),
    showZ: S.Bool({ default: true })
  }),

  reactor: function (props) {
    const entity = useEntityContext()
    const cameraGizmoComponent = useComponent(entity, CameraGizmoComponent)
    const inputPointerEntities = InputPointerComponent.usePointersForCamera(cameraGizmoComponent.cameraEntity.value)

    useEffect(() => {
      const gizmoVisualEntity = createEntity()
      setComponent(gizmoVisualEntity, EntityTreeComponent, {
        parentEntity: cameraGizmoComponent.sceneEntity.value ?? getState(ReferenceSpaceState).originEntity
      })

      setComponent(entity, NameComponent, 'cameraGizmoEntity')
      setComponent(entity, CameraGizmoTagComponent)
      setComponent(entity, VisibleComponent)

      setComponent(gizmoVisualEntity, NameComponent, 'cameraGizmoVisualEntity')
      setComponent(gizmoVisualEntity, CameraGizmoVisualComponent, {
        sceneEntity: cameraGizmoComponent.sceneEntity.value
      })
      setComponent(gizmoVisualEntity, CameraGizmoTagComponent)
      setComponent(gizmoVisualEntity, VisibleComponent)

      cameraGizmoComponent.visualEntity.set(gizmoVisualEntity)
      return () => {
        removeComponent(gizmoVisualEntity, CameraGizmoVisualComponent)
        removeEntity(gizmoVisualEntity)
        cameraGizmoComponent.visualEntity.set(UndefinedEntity)
      }
    }, [])

    useImmediateEffect(() => {
      if (
        !cameraGizmoComponent.enabled.value ||
        !cameraGizmoComponent.visualEntity.value ||
        inputPointerEntities.length
      )
        return

      onGizmoCommit(entity)
    }, [inputPointerEntities])

    InputComponent.useExecuteWithInput(
      () => {
        const cameraGizmoComponent = getComponent(entity, CameraGizmoComponent)
        if (!cameraGizmoComponent) return
        if (!cameraGizmoComponent.enabled || !cameraGizmoComponent.visualEntity) return
        if (!cameraGizmoComponent.cameraEntity || !getState(ReferenceSpaceState).viewerEntity) return

        onPointerHover(entity)

        const pickerButtons = InputComponent.getButtons(
          getComponent(cameraGizmoComponent.visualEntity, CameraGizmoVisualComponent).picker
        )

        //pointer down
        if (pickerButtons?.PrimaryClick?.down) {
          onPointerDown(entity)
        }

        if (pickerButtons?.PrimaryClick?.up) {
          onPointerUp(entity)
          onPointerLost(entity)
        }
      },
      InputExecutionOrder.Before,
      true
    )

    return null
  }
})
