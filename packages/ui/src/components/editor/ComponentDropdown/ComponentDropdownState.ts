import { Entity, EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { defineState, getMutableState, none } from '@ir-engine/hyperflux'

export const ComponentDropdownState = defineState({
  name: 'ComponentDropdownState',
  initial: () => ({
    componentStates: {} as Record<EntityUUID, Record<string, boolean>> //use name as key
  }),

  addOrUpdateEntity: (entity: Entity, componentName: string, value: boolean, updateIfExists: boolean = true) => {
    const entityUUID = UUIDComponent.get(entity)
    if (!entityUUID) return

    const componentStates = getMutableState(ComponentDropdownState).componentStates
    // Ensure entityUUID entry exists; if not, initialize it as an empty object
    if (!componentStates.value[entityUUID]) {
      componentStates[entityUUID].set({} as Record<string, boolean>)

      // Set the componentName state within the specific entityUUID
      componentStates[entityUUID][componentName].set(value)
    }

    //default to true, this way we can make initialization calls that only run if there is not yet an entry by passing false
    if (updateIfExists) {
      // Set the componentName state within the specific entityUUID
      componentStates[entityUUID][componentName].set(value)
    }
  },

  addOrUpdateUUID: (entityUUID: EntityUUID, componentName: string, value: boolean) => {
    const componentStates = getMutableState(ComponentDropdownState).componentStates
    // Ensure entityUUID entry exists; if not, initialize it as an empty object
    if (!componentStates.value[entityUUID]) {
      componentStates[entityUUID].set({} as Record<string, boolean>)
    }

    // Set the componentName state within the specific entityUUID
    componentStates[entityUUID][componentName].set(value)
  },

  removeEntityUUIDs: (entityUUIDs: EntityUUID[]) => {
    const componentStates = getMutableState(ComponentDropdownState).componentStates
    for (const entityUUID of entityUUIDs) {
      componentStates[entityUUID].set(none)
    }
  },

  removeComponentEntry: (entities: Entity[], componentName: string) => {
    for (const entity of entities) {
      const entityUUID = UUIDComponent.get(entity)
      if (!entityUUID) continue

      const componentStates = getMutableState(ComponentDropdownState).componentStates
      if (!componentStates.value[entityUUID]) continue

      componentStates[entityUUID][componentName].set(none)

      const record = componentStates[entityUUID].value
      if (Object.keys(record).length === 0) {
        componentStates[entityUUID].set(none)
      }
    }
  }
})
