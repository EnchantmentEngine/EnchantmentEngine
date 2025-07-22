/** Camera Modes. */
export const FollowCameraMode = {
  FirstPerson: 'FirstPerson',
  ShoulderCam: 'ShoulderCam',
  ThirdPerson: 'ThirdPerson',
  TopDown: 'TopDown',
  Strategic: 'Strategic',
  Dynamic: 'Dynamic'
} as const

export type FollowCameraMode = (typeof FollowCameraMode)[keyof typeof FollowCameraMode]

export const FollowCameraShoulderSide = {
  Left: 'Left',
  Right: 'Right'
} as const

export type FollowCameraShoulderSide = (typeof FollowCameraShoulderSide)[keyof typeof FollowCameraShoulderSide]
