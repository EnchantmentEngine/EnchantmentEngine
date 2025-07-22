import { Vector3 } from 'three'

export const TransformPivot = {
  Origin: 'Origin' as const,
  FirstSelected: 'FirstSelected' as const,
  Center: 'Center' as const,
  Bottom: 'Bottom' as const
}
export const TransformMode = {
  translate: 'translate' as const,
  rotate: 'rotate' as const,
  scale: 'scale' as const
}

export const TransformAxis = {
  X: 'X' as const,
  Y: 'Y' as const,
  Z: 'Z' as const,
  XY: 'XY' as const,
  YZ: 'YZ' as const,
  XZ: 'XZ' as const,
  XYZ: 'XYZ' as const,
  XYZE: 'XYZE' as const,
  E: 'E' as const,
  Xn: 'Xn' as const,
  Yn: 'Yn' as const,
  Zn: 'Zn' as const
}

export const TransformAxisConstraints = {
  X: new Vector3(1, 0, 0),
  Y: new Vector3(0, 1, 0),
  Z: new Vector3(0, 0, 1),
  XY: new Vector3(1, 1, 0),
  YZ: new Vector3(0, 1, 1),
  XZ: new Vector3(1, 0, 1),
  XYZ: new Vector3(1, 1, 1)
}
export const TransformAxisAction = {
  Translate: 'Translate' as const,
  Rotate: 'Rotate' as const,
  Scale: 'Scale' as const
}
export const SnapMode = {
  Disabled: 'Disabled' as const,
  Grid: 'Grid' as const
}

export const TransformSpace = {
  world: 'world' as const,
  local: 'local' as const
}

export type TransformAxisActionType = (typeof TransformAxisAction)[keyof typeof TransformAxisAction]
export type TransformModeType = (typeof TransformMode)[keyof typeof TransformMode]
export type TransformSpaceType = (typeof TransformSpace)[keyof typeof TransformSpace]
export type TransformPivotType = (typeof TransformPivot)[keyof typeof TransformPivot]
export type TransformAxisType = (typeof TransformAxis)[keyof typeof TransformAxis]
export type SnapModeType = (typeof SnapMode)[keyof typeof SnapMode]
