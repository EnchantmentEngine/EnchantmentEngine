import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'

export const AvatarAxesControlScheme = {
  Move: 'AvatarControlScheme_Move' as const,
  Teleport: 'AvatarControlScheme_Teleport' as const
}

export const AvatarControllerType = {
  None: 'AvatarControllerType_None' as const,
  XRHands: 'AvatarControllerType_XRHands' as const,
  OculusQuest: 'AvatarControllerType_OculusQuest' as const
}

export const AvatarInputSettingsState = defineState({
  name: 'AvatarInputSettingsState',
  initial: () => ({
    controlType: AvatarControllerType.None as (typeof AvatarControllerType)[keyof typeof AvatarControllerType],
    leftAxesControlScheme:
      AvatarAxesControlScheme.Move as (typeof AvatarAxesControlScheme)[keyof typeof AvatarAxesControlScheme],
    rightAxesControlScheme:
      AvatarAxesControlScheme.Teleport as (typeof AvatarAxesControlScheme)[keyof typeof AvatarAxesControlScheme],
    invertRotationAndMoveSticks: true,
    showAvatar: true
  }),
  extension: syncStateWithLocalStorage([
    'controlType',
    'leftAxesControlScheme',
    'rightAxesControlScheme',
    'invertRotationAndMoveSticks',
    'showAvatar'
  ])
})
