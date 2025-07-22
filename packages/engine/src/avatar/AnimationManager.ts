import { defineState } from '@ir-engine/hyperflux'

import { Entity } from '@ir-engine/ecs'

export const AnimationState = defineState({
  name: 'AnimationState',
  initial: () => ({
    loadedAnimations: {} as Record<string, Entity>,
    avatarLoadingEffect: false
  })
})
