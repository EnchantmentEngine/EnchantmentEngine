import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineState, getMutableState } from '@ir-engine/hyperflux'

export const ColliderLoadingState = defineState({
  name: 'ColliderLoadingState',
  initial: () => ({
    pendingColliders: new Map<Entity, boolean>(),
    allCollidersLoaded: false
  }),

  // Helper functions
  registerPendingCollider: (entity: Entity) => {
    const state = getMutableState(ColliderLoadingState)
    state.pendingColliders.merge({ [entity]: false })
    state.allCollidersLoaded.set(false)
  },

  markColliderLoaded: (entity: Entity) => {
    const state = getMutableState(ColliderLoadingState)
    if (state.pendingColliders.value.has(entity)) {
      state.pendingColliders.merge({ [entity]: true })

      // Check if all colliders are now loaded
      const allLoaded = Array.from(state.pendingColliders.value.keys()).every(
        (e) => state.pendingColliders[e].value === true
      )

      if (allLoaded) {
        state.allCollidersLoaded.set(true)
      }
    }
  },

  reset: () => {
    const state = getMutableState(ColliderLoadingState)
    state.pendingColliders.set(new Map())
    state.allCollidersLoaded.set(false)
  }
})
