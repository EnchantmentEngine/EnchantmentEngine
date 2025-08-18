import { useEffect } from 'react'
import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'

import {
  createEntity,
  defineComponent,
  Entity,
  EntitySchema,
  EntityTreeComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useEntityContext
} from '@ir-engine/ecs'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import {
  TransformAxis,
  TransformMode,
  TransformPivot,
  TransformSpace
} from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { InputComponent, InputExecutionOrder } from '@ir-engine/spatial/src/input/components/InputComponent'

import { Schema } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { TransformGizmoTagComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import {
  onPointerDown,
  onPointerDrag,
  onPointerHover,
  onPointerUp,
  transformGizmoUpdate
} from '../../../functions/gizmos/transformGizmoHelper'
import { TransformGizmoVisualComponent } from './TransformGizmoVisualComponent'

const gizmoPlane = new Mesh(
  new PlaneGeometry(100000, 100000, 2, 2),
  new MeshBasicMaterial({
    visible: false,
    wireframe: true,
    side: DoubleSide,
    transparent: true,
    opacity: 0.1,
    toneMapped: false
  })
)

const createTransformGizmoVisualEntity = (originEntity) => {
  const gizmoVisualEntity = createEntity()
  setComponent(gizmoVisualEntity, EntityTreeComponent, { parentEntity: originEntity })
  setComponent(gizmoVisualEntity, NameComponent, 'transformGizmoVisualEntity')
  setComponent(gizmoVisualEntity, TransformGizmoVisualComponent)
  setComponent(gizmoVisualEntity, TransformGizmoTagComponent)
  setComponent(gizmoVisualEntity, VisibleComponent)
  setComponent(gizmoVisualEntity, TransformComponent)
  setComponent(gizmoVisualEntity, InputComponent)
  ObjectLayerMaskComponent.setLayer(gizmoVisualEntity, ObjectLayers.TransformGizmo)

  return gizmoVisualEntity
}

const createTransformGizmoPlaneEntity = (originEntity) => {
  const gizmoPlaneEntity = createEntity()
  setComponent(gizmoPlaneEntity, EntityTreeComponent, { parentEntity: originEntity })
  setComponent(gizmoPlaneEntity, NameComponent, 'transformGizmoPlaneEntity')
  setComponent(gizmoPlaneEntity, TransformComponent)
  setComponent(gizmoPlaneEntity, VisibleComponent)
  setComponent(gizmoPlaneEntity, MeshComponent, gizmoPlane)
  //setComponent(gizmoPlaneEntity, TransformGizmoTagComponent) remove the gizmo plane from being considered in theheuristic , we use TransformGizmoTagComponent query to collect gizmo entities for heuristic
  ObjectLayerMaskComponent.setLayer(gizmoPlaneEntity, ObjectLayers.TransformGizmo)

  return gizmoPlaneEntity
}

const createTransformGizmoPivotEntity = (originEntity) => {
  const pivotEntity = createEntity()

  setComponent(pivotEntity, EntityTreeComponent, { parentEntity: originEntity })
  setComponent(pivotEntity, NameComponent, 'transformGizmoPivotEntity')
  setComponent(pivotEntity, TransformComponent)
  setComponent(pivotEntity, VisibleComponent)
  setComponent(pivotEntity, TransformGizmoTagComponent)
  return pivotEntity
}

export const TransformGizmoControlComponent = defineComponent({
  name: 'TransformGizmoControlComponent',

  schema: Schema.Object({
    controlledEntities: Schema.Array(EntitySchema.Entity()),
    visualEntity: EntitySchema.Entity(),
    planeEntity: EntitySchema.Entity(),
    pivotEntity: EntitySchema.Entity(),
    dragging: Schema.Bool({ default: false }),
    axis: Schema.Union([Schema.Null(), Schema.LiteralUnion(Object.values(TransformAxis))]),
    space: Schema.LiteralUnion(Object.values(TransformSpace), { default: TransformSpace.world }),
    mode: Schema.LiteralUnion(Object.values(TransformMode), { default: TransformMode.translate }),
    transformPivot: Schema.LiteralUnion(Object.values(TransformPivot), { default: TransformPivot.FirstSelected }),
    translationSnap: Schema.Union([Schema.Null(), Schema.Number()]),
    rotationSnap: Schema.Union([Schema.Null(), Schema.Number()]),
    scaleSnap: Schema.Union([Schema.Null(), Schema.Number()]),
    size: Schema.Number({ default: 1 }),
    showX: Schema.Bool({ default: true }),
    showY: Schema.Bool({ default: true }),
    showZ: Schema.Bool({ default: true }),
    pivotBounds: T.Box3(),
    pivotStartPosition: T.Vec3(),
    pivotStartRotation: T.Quaternion(),
    pointerPlaneStartPosition: T.Vec3(),
    pointerPlaneEndPosition: T.Vec3(),
    rotationAxis: T.Vec3(),
    rotationAngle: Schema.Number({ default: 0 }),
    eye: T.Vec3()
  }),

  useControlEntities: (controlledEntities: Entity[]) => {
    const originEntity = useMutableState(ReferenceSpaceState).originEntity.value
    const controlledEntity = controlledEntities[0]
    const gizmoEntity = useHookstate(UndefinedEntity)

    useEffect(() => {
      if (!originEntity) return
      // create the entities once
      const gizmoVisualEntity = createTransformGizmoVisualEntity(originEntity)
      const gizmoPlaneEntity = createTransformGizmoPlaneEntity(originEntity)
      const pivotEntity = createTransformGizmoPivotEntity(originEntity)

      const gizmoControlEntity = createEntity()
      setComponent(gizmoControlEntity, EntityTreeComponent, { parentEntity: originEntity })
      setComponent(gizmoControlEntity, NameComponent, 'transformGizmoControlEntity')
      setComponent(gizmoControlEntity, TransformGizmoControlComponent, {
        visualEntity: gizmoVisualEntity,
        planeEntity: gizmoPlaneEntity,
        pivotEntity: pivotEntity
      })
      setComponent(gizmoControlEntity, TransformGizmoTagComponent)
      setComponent(gizmoControlEntity, VisibleComponent)
      setComponent(gizmoControlEntity, TransformComponent)
      gizmoEntity.set(gizmoControlEntity)

      return () => {
        removeEntity(gizmoControlEntity)
        removeEntity(gizmoVisualEntity)
        removeEntity(gizmoPlaneEntity)
        removeEntity(pivotEntity)
        gizmoEntity.set(UndefinedEntity)
      }
    }, [originEntity])

    useEffect(() => {
      if (!gizmoEntity.value) return

      const gizmoPlaneEntity = getComponent(gizmoEntity.value, TransformGizmoControlComponent).planeEntity
      const gizmoVisualEntity = getComponent(gizmoEntity.value, TransformGizmoControlComponent).visualEntity

      setVisibleComponent(gizmoVisualEntity, controlledEntities.length > 0)
      setVisibleComponent(gizmoPlaneEntity, controlledEntities.length > 0)

      if (!controlledEntity || !hasComponent(controlledEntity, TransformComponent)) return

      setComponent(gizmoEntity.value, TransformGizmoControlComponent, {
        controlledEntities: controlledEntities
      })
    }, [gizmoEntity, JSON.stringify(controlledEntities)])

    return gizmoEntity.value
  },

  reactor: () => {
    const gizmoControlEntity = useEntityContext()

    InputComponent.useExecuteWithInput(
      () => {
        const gizmoControlComponent = getOptionalComponent(gizmoControlEntity, TransformGizmoControlComponent)
        if (!gizmoControlComponent) return
        const visualComponent = getOptionalComponent(gizmoControlComponent.visualEntity, TransformGizmoVisualComponent)
        if (!visualComponent) return

        const pickerEntity = visualComponent.picker

        const inputSourceEntities = InputComponent.getInputSourceEntities(pickerEntity)
        const pickerButtons = InputComponent.getButtons(pickerEntity)

        onPointerHover(gizmoControlEntity, inputSourceEntities)

        if (pickerButtons?.PrimaryClick?.pressed) {
          const pointerEntity = pickerButtons.PrimaryClick.inputSourceEntity

          if (pickerButtons?.PrimaryClick?.down) {
            onPointerDown(gizmoControlEntity, pointerEntity)
          }

          if (pickerButtons?.PrimaryClick?.dragging) {
            onPointerDrag(gizmoControlEntity, pointerEntity)
          }

          if (pickerButtons?.PrimaryClick?.up) {
            onPointerUp(gizmoControlEntity, pointerEntity)
          }
        }

        transformGizmoUpdate(gizmoControlEntity)
      },
      InputExecutionOrder.Before,
      true
    )

    return null
  }
})
