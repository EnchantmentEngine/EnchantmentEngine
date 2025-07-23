import { Entity, EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { defineState, getMutableState, none } from '@ir-engine/hyperflux'

export const TransformUniformScaleState = defineState({
  name: 'TransformUniformScaleState',
  initial: () => ({
    uniformScaleState: {} as Record<EntityUUID, true> //use name as key
  }),

  getEntityState: (entity: Entity): boolean => {
    const entityUUID = UUIDComponent.get(entity)
    if (entityUUID) {
      const componentStates = getMutableState(TransformUniformScaleState).uniformScaleState
      return componentStates.value[entityUUID] ?? false
    }

    return false
  },

  addOrUpdateEntity: (entity: Entity) => {
    const entityUUID = UUIDComponent.get(entity)
    if (!entityUUID) return

    const componentStates = getMutableState(TransformUniformScaleState).uniformScaleState
    // Ensure entityUUID entry exists; if not, initialize it as an empty object
    if (!componentStates.value[entityUUID]) {
      componentStates[entityUUID].set(true)
    }
  },

  removeEntry: (entity: Entity) => {
    const entityUUID = UUIDComponent.get(entity)
    if (!entityUUID) return

    const componentStates = getMutableState(TransformUniformScaleState).uniformScaleState
    if (!componentStates.value[entityUUID]) return

    componentStates[entityUUID].set(none)
  },

  removeEntries: (entities: Entity[]) => {
    for (const entity of entities) {
      TransformUniformScaleState.removeEntry(entity)
    }
  }
})
