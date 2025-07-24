import { Entity, UndefinedEntity } from '@ir-engine/ecs'
import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'
import {
  SnapMode,
  SnapModeType,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace,
  TransformSpaceType
} from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { EditorMode, EditorModeType } from '../constants/EditorModeTypes'
import { VolumeVisibility } from '../functions/gizmos/studioIconGizmoHelper'

export const PlacementMode = {
  DRAG: 0,
  CLICK: 1
} as const

export type PlacementModeType = (typeof PlacementMode)[keyof typeof PlacementMode]

export const EditorHelperState = defineState({
  name: 'EditorHelperState',
  initial: () => ({
    editorMode: EditorMode.Simple as EditorModeType,
    transformMode: TransformMode.translate as TransformModeType,
    transformSpace: TransformSpace.local as TransformSpaceType,
    transformPivot: TransformPivot.FirstSelected as TransformPivotType,
    transformGizmoEntity: UndefinedEntity as Entity,
    gridSnap: SnapMode.Disabled as SnapModeType,
    translationSnap: 0.5,
    rotationSnap: 10,
    scaleSnap: 0.1,
    placementMode: PlacementMode.DRAG as PlacementModeType,
    gizmoEnabled: true,
    gridVisibility: false,
    gridHeight: 0,
    showGlbChildren: true,
    volumeVisibility: 'Auto' as keyof typeof VolumeVisibility,
    editorIconMaxSize: 0.5,
    editorIconMinSize: 0.4
  }),
  extension: syncStateWithLocalStorage([
    'snapMode',
    'translationSnap',
    'rotationSnap',
    'scaleSnap',
    'gridVisibility',
    'gridHeight'
  ]),
  reactor: () => {
    return null
  }
})
