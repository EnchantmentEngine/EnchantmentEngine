import { useEffect } from 'react'

import { getComponent, setComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@ir-engine/ecs/src/SystemGroups'

import { EngineState, Entity } from '@ir-engine/ecs'
import { getState, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { CameraGizmoTagComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { SnapMode } from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import {
  filterEntitiesByViewer,
  InputHeuristicState,
  IntersectionData
} from '@ir-engine/spatial/src/input/functions/ClientInputHeuristics'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { TransformGizmoTagComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { MathUtils, Raycaster, Vector3 } from 'three'
import { TransformGizmoControlComponent } from '../classes/gizmo/transform/TransformGizmoControlComponent'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'

/**Editor InputComponent raycast query */
const inputObjectsQuery = defineQuery([InputComponent, VisibleComponent, ObjectComponent])
const gizmoPickerObjectsQuery = defineQuery([
  InputComponent,
  ObjectComponent,
  VisibleComponent,
  TransformGizmoTagComponent
])
export const transformGizmoControllerQuery = defineQuery([TransformGizmoControlComponent])

//prevent query from detecting CameraGizmoVisualEntity which has no ObjectComponent but has CameraGizmoTagComponent
const cameraGizmoQuery = defineQuery([CameraGizmoTagComponent, InputComponent, VisibleComponent, ObjectComponent])

const _raycaster = new Raycaster()
_raycaster.layers.enable(ObjectLayers.Gizmos)

export function editorInputHeuristic(
  viewerEntity: Entity,
  intersectionData: Set<IntersectionData>,
  position: Vector3,
  direction: Vector3
) {
  const isEditing = getState(EngineState).isEditing
  if (!isEditing) return

  const gizmoEnabled = getState(EditorHelperState).gizmoEnabled
  if (!gizmoEnabled) return

  _raycaster.set(position, direction)

  const pickerObj = gizmoPickerObjectsQuery() // gizmo heuristic
  const cameraGizmo = cameraGizmoQuery() //camera gizmo heuristic

  //concatenating cameraGizmo to both pickerObjects(transformGizmo) and inputObjects
  const inputObj = [] as Entity[]

  const objects = (
    pickerObj.length > 0
      ? inputObj.concat(cameraGizmo).concat(pickerObj)
      : inputObj.concat(inputObjectsQuery()).concat(cameraGizmo)
  ) // gizmo heuristic
    .filter((eid) => filterEntitiesByViewer(eid, viewerEntity))
    .map((eid) => getComponent(eid, ObjectComponent))

  //camera gizmos layer should always be active here, since it doesn't disable based on transformGizmo existing
  pickerObj.length > 0
    ? _raycaster.layers.enable(ObjectLayers.TransformGizmo)
    : _raycaster.layers.disable(ObjectLayers.TransformGizmo)

  const hits = _raycaster.intersectObjects(objects, true)
  for (const hit of hits) {
    intersectionData.add({ entity: hit.object.entity!, distance: hit.distance })
  }
}

const useTransformGizmoControl = (entities: Entity[]) => {
  const gizmoEntity = TransformGizmoControlComponent.useControlEntities(entities)
  const gizmoControlComponent = useOptionalComponent(gizmoEntity, TransformGizmoControlComponent)
  const editorHelperState = useMutableState(EditorHelperState)

  useImmediateEffect(() => {
    editorHelperState.transformGizmoEntity.set(gizmoEntity)
  }, [gizmoEntity])

  useImmediateEffect(() => {
    if (!gizmoControlComponent) return
    const mode = editorHelperState.transformMode.value
    setComponent(gizmoEntity, TransformGizmoControlComponent, { mode })
  }, [gizmoEntity, editorHelperState.transformMode])

  useImmediateEffect(() => {
    if (!gizmoControlComponent) return
    const space = editorHelperState.transformSpace.value
    setComponent(gizmoEntity, TransformGizmoControlComponent, { space })
  }, [gizmoEntity, editorHelperState.transformSpace])

  useImmediateEffect(() => {
    if (!gizmoControlComponent) return
    setComponent(gizmoEntity, TransformGizmoControlComponent, {
      transformPivot: editorHelperState.transformPivot.value
    })
  }, [gizmoEntity, editorHelperState.transformPivot])

  useEffect(() => {
    if (!gizmoControlComponent) return
    switch (editorHelperState.gridSnap.value) {
      case SnapMode.Disabled: // continous update
        setComponent(gizmoEntity, TransformGizmoControlComponent, {
          translationSnap: 0,
          rotationSnap: 0,
          scaleSnap: 0
        })
        break
      case SnapMode.Grid:
        setComponent(gizmoEntity, TransformGizmoControlComponent, {
          translationSnap: editorHelperState.translationSnap.value,
          rotationSnap: MathUtils.degToRad(editorHelperState.rotationSnap.value),
          scaleSnap: editorHelperState.scaleSnap.value
        })
        break
    }
  }, [gizmoEntity, editorHelperState.gridSnap])

  useEffect(() => {
    if (!gizmoControlComponent) return
    setComponent(gizmoEntity, TransformGizmoControlComponent, {
      translationSnap: editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.translationSnap.value : 0
    })
  }, [gizmoEntity, editorHelperState.translationSnap])

  useEffect(() => {
    if (!gizmoControlComponent) return
    setComponent(gizmoEntity, TransformGizmoControlComponent, {
      rotationSnap:
        editorHelperState.gridSnap.value === SnapMode.Grid
          ? MathUtils.degToRad(editorHelperState.rotationSnap.value)
          : 0
    })
  }, [gizmoEntity, editorHelperState.rotationSnap])

  useEffect(() => {
    if (!gizmoControlComponent) return
    setComponent(gizmoEntity, TransformGizmoControlComponent, {
      scaleSnap: editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.scaleSnap.value : 0
    })
  }, [gizmoEntity, editorHelperState.scaleSnap])

  useEffect(() => {
    if (!gizmoControlComponent) return
    setComponent(gizmoEntity, TransformGizmoControlComponent, {
      rotationSnap:
        editorHelperState.gridSnap.value === SnapMode.Grid
          ? MathUtils.degToRad(editorHelperState.rotationSnap.value)
          : 0
    })
  }, [gizmoEntity, editorHelperState.rotationSnap])

  useEffect(() => {
    if (!gizmoControlComponent) return
    setComponent(gizmoEntity, TransformGizmoControlComponent, {
      scaleSnap: editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.scaleSnap.value : 0
    })
  }, [gizmoEntity, editorHelperState.scaleSnap])

  useEffect(() => {
    if (!gizmoControlComponent) return
    setComponent(gizmoEntity, TransformGizmoControlComponent, {
      scaleSnap: editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.scaleSnap.value : 0
    })
  }, [gizmoEntity, editorHelperState.scaleSnap])
}

const reactor = () => {
  useEffect(() => {
    InputHeuristicState.addHeuristic(1, editorInputHeuristic)
  }, [])

  const selectedEntities = SelectionState.useSelectedEntities()

  useTransformGizmoControl(selectedEntities)

  return null
}

export const TransformGizmoSystem = defineSystem({
  uuid: 'ee.editor.TransformGizmoSystem',
  insert: { with: InputSystemGroup },
  reactor
})
