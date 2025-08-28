import { useEffect } from 'react'

import { EntitySchema, EntityTreeComponent, createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'

import { Schema, getState, useImmediateEffect } from '@ir-engine/hyperflux'
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

  schema: Schema.Object({
    sceneEntity: EntitySchema.Entity(),
    cameraEntity: EntitySchema.Entity(),
    visualEntity: EntitySchema.Entity(),
    enabled: Schema.Bool({ default: true }),
    axis: Schema.Union([Schema.Null(), Schema.LiteralUnion(Object.values(TransformAxis))]),
    showX: Schema.Bool({ default: true }),
    showY: Schema.Bool({ default: true }),
    showZ: Schema.Bool({ default: true })
  }),

  reactor: function (props) {
    const entity = useEntityContext()
    const cameraGizmoComponent = useComponent(entity, CameraGizmoComponent)
    const inputPointerEntities = InputPointerComponent.usePointersForCamera(cameraGizmoComponent.cameraEntity)

    useEffect(() => {
      const gizmoVisualEntity = createEntity()
      setComponent(gizmoVisualEntity, EntityTreeComponent, {
        parentEntity: cameraGizmoComponent.sceneEntity ?? getState(ReferenceSpaceState).originEntity
      })

      setComponent(entity, NameComponent, 'cameraGizmoEntity')
      setComponent(entity, CameraGizmoTagComponent)
      setComponent(entity, VisibleComponent)

      setComponent(gizmoVisualEntity, NameComponent, 'cameraGizmoVisualEntity')
      setComponent(gizmoVisualEntity, CameraGizmoVisualComponent, {
        sceneEntity: cameraGizmoComponent.sceneEntity
      })
      setComponent(gizmoVisualEntity, CameraGizmoTagComponent)
      setComponent(gizmoVisualEntity, VisibleComponent)

      setComponent(entity, CameraGizmoComponent, { visualEntity: gizmoVisualEntity })
      return () => {
        removeComponent(gizmoVisualEntity, CameraGizmoVisualComponent)
        removeEntity(gizmoVisualEntity)
      }
    }, [])

    useImmediateEffect(() => {
      if (!cameraGizmoComponent.enabled || !cameraGizmoComponent.visualEntity || inputPointerEntities.length) return

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
