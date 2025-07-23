/** Camera Modes. */
export const CameraMode = {
  FOLLOW: 'FOLLOW' as const,
  GUIDED: 'GUIDED' as const
}

export type CameraModeType = (typeof CameraMode)[keyof typeof CameraMode]

export const CameraScrollBehavior = {
  Wrap: 'Wrap' as const,
  Clamp: 'Clamp' as const
}
export type CameraScrollBehaviorType = (typeof CameraScrollBehavior)[keyof typeof CameraScrollBehavior]

export const PoiScrollTransition = {
  Scrolling: 'Scrolling' as const,
  Snapping: 'Snapping' as const
}
export type PoiScrollTransitionType = (typeof PoiScrollTransition)[keyof typeof PoiScrollTransition]
