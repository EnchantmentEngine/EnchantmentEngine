import { defineState } from '@ir-engine/hyperflux'

/*todo: get rid of this in favor of direct translation from animation root motion*/
export const AvatarMovementSettingsState = defineState({
  name: 'AvatarMovementSettingsState',
  initial: () => ({
    // Speeds are set by the animation's average root motion speed
    walkSpeed: 0,
    runSpeed: 0,
    jumpHeight: 2
  })
})
