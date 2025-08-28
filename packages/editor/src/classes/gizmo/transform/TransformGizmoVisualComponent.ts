import { useEffect } from 'react'

import {
  createEntity,
  defineComponent,
  Entity,
  EntitySchema,
  EntityTreeComponent,
  removeEntityNodeRecursively,
  setComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { Schema, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import {
  TransformComponent,
  TransformGizmoTagComponent
} from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Object3D } from 'three'
import { gizmo, helper, iconGizmoHelper, picker, setupGizmo } from '../../../constants/GizmoPresets'
import { EditorHelperState } from '../../../services/EditorHelperState'

export const TransformGizmoVisualComponent = defineComponent({
  name: 'TransformGizmoVisualComponent',

  schema: Schema.Object({
    gizmo: EntitySchema.Entity(),
    picker: EntitySchema.Entity(),
    helper: EntitySchema.Entity()
  }),

  reactor: function () {
    const gizmoVisualEntity = useEntityContext()
    const mode = useMutableState(EditorHelperState).transformMode.value

    useEffect(() => {
      const entities = [] as Entity[]

      const gizmoEntity = createEntity()
      setComponent(gizmoEntity, EntityTreeComponent, { parentEntity: gizmoVisualEntity })
      setComponent(gizmoEntity, ObjectComponent, new Object3D())
      setComponent(gizmoEntity, NameComponent, `transformGizmoEntity`)
      setComponent(gizmoEntity, TransformGizmoTagComponent)
      setComponent(gizmoEntity, TransformComponent)
      setComponent(gizmoEntity, VisibleComponent)
      setupGizmo(gizmoEntity, gizmo[mode], ObjectLayers.TransformGizmo)
      ObjectLayerMaskComponent.setLayer(gizmoEntity, ObjectLayers.TransformGizmo)
      setComponent(gizmoVisualEntity, TransformGizmoVisualComponent, { gizmo: gizmoEntity })
      entities.push(gizmoEntity)

      const helperEntity = createEntity()
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: gizmoVisualEntity })
      setComponent(helperEntity, ObjectComponent, new Object3D())
      setComponent(helperEntity, NameComponent, `transformGizmoHelperEntity`)
      setComponent(helperEntity, TransformGizmoTagComponent)
      setComponent(helperEntity, VisibleComponent)
      setComponent(helperEntity, TransformComponent)
      setupGizmo(helperEntity, helper[mode], ObjectLayers.TransformGizmo)
      setupGizmo(helperEntity, iconGizmoHelper, ObjectLayers.NodeHelper)
      setComponent(gizmoVisualEntity, TransformGizmoVisualComponent, { helper: helperEntity })
      entities.push(helperEntity)

      const pickerEntity = createEntity()
      setComponent(pickerEntity, EntityTreeComponent, { parentEntity: gizmoVisualEntity })
      setComponent(pickerEntity, ObjectComponent, new Object3D())
      setComponent(pickerEntity, NameComponent, `transformGizmoPickerEntity`)
      setComponent(pickerEntity, TransformGizmoTagComponent)
      setComponent(pickerEntity, VisibleComponent)
      setComponent(pickerEntity, TransformComponent)
      setComponent(pickerEntity, InputComponent)
      setupGizmo(pickerEntity, picker[mode], ObjectLayers.TransformGizmo)
      ObjectLayerMaskComponent.setLayer(pickerEntity, ObjectLayers.TransformGizmo)
      setComponent(gizmoVisualEntity, TransformGizmoVisualComponent, { picker: pickerEntity })
      entities.push(pickerEntity)

      return () => {
        for (const entity of entities) {
          removeEntityNodeRecursively(entity)
        }
      }
    }, [mode])

    return null
  }
})
