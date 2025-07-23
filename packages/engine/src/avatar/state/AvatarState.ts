import { defineState } from '@ir-engine/hyperflux'

export const LocalAvatarState = defineState({
  name: 'ee.engine.LocalAvatarState',
  initial: {
    avatarReady: false
  }
})
