import { getMutableState, getState } from '@ir-engine/hyperflux'
import {
  SnapMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace,
  TransformSpaceType
} from '@ir-engine/spatial/src/common/constants/TransformConstants'

import { EditorHelperState } from '../services/EditorHelperState'

export const setTransformMode = (mode: TransformModeType): void => {
  getMutableState(EditorHelperState).transformMode.set(mode)
}

export const toggleSnapMode = (): void => {
  getMutableState(EditorHelperState).gridSnap.set((value) =>
    value === SnapMode.Disabled ? SnapMode.Grid : SnapMode.Disabled
  )
}

export const setTransformPivot = (transformPivot: TransformPivotType) => {
  getMutableState(EditorHelperState).transformPivot.set(transformPivot)
}

export const toggleTransformPivot = () => {
  const pivots = Object.keys(TransformPivot)
  const nextIndex = (pivots.indexOf(getState(EditorHelperState).transformPivot) + 1) % pivots.length

  getMutableState(EditorHelperState).transformPivot.set(TransformPivot[pivots[nextIndex]])
}

export const setTransformSpace = (transformSpace: TransformSpaceType) => {
  getMutableState(EditorHelperState).transformSpace.set(transformSpace)
}

export const toggleTransformSpace = () => {
  getMutableState(EditorHelperState).transformSpace.set((transformSpace) =>
    transformSpace === TransformSpace.world ? TransformSpace.local : TransformSpace.world
  )
}
