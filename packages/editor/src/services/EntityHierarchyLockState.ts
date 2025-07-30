import { Entity } from '@ir-engine/ecs'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'

export const EntityHierarchyLockState = defineState({
  name: 'ir.editor.EntityHierarchyLockState',
  initial: () => ({
    lockedEntities: {} as Record<Entity, boolean> // Map to store locked state of entities
  }),
  // Updates the locked state of a specific entity
  updateLocked: (entity: Entity, isLocked: boolean) => {
    const state = getMutableState(EntityHierarchyLockState)
    state.lockedEntities[entity].set(isLocked) // Replace the Map entirely
  },

  // Retrieves the lock status of a specific entity
  isEntityLocked: (entity: Entity): boolean => {
    const state = getState(EntityHierarchyLockState)
    return state.lockedEntities[entity] ?? false // Default to false if not set
  },

  // Clears all locked entities
  clearLockedEntities: () => {
    const state = getState(EntityHierarchyLockState)
    state.lockedEntities = {} // Replace the Map entirely with an empty one
  }
})
