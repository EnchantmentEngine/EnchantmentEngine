import {
  Entity,
  EntityID,
  EntityUUID,
  getAuthoringCounterpart,
  getComponent,
  getOptionalComponent,
  hasComponent,
  Layers,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'
import { useHookstate } from '@ir-engine/hyperflux'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import * as bitECS from 'bitecs'
import { useEffect } from 'react'

export type CallbackOptionType = {
  callbacks: Array<{
    label: string
    value: EntityID | 'Self'
  }>
  label: string
  value: EntityID | 'Self'
}

export type NodeOptionsType = {
  label: string
  value: EntityID | 'Self'
}

/**
 * Returns an options list of entities in the same source that have a CallbackComponent
 *
 * @param entity An entity in the same source
 * @returns
 */
export const useCallbackQueryOptions = (entity: Entity) => {
  const sourceEntity = UUIDComponent.getSourceEntity(entity)
  const source = UUIDComponent.getAsSourceID(sourceEntity)
  const query = UUIDComponent.getEntitiesBySource(source).filter(
    (e) => !!getAuthoringCounterpart(e) && hasComponent(e, CallbackComponent)
  )
  return query
    .map((e) => {
      const options = [] as CallbackOptionType[]
      const entityCallbacks = getOptionalComponent(e, CallbackComponent)
      if (entityCallbacks) {
        options.push({
          label: e === entity ? 'Self' : getComponent(e, NameComponent),
          value: e === entity ? 'Self' : getComponent(e, UUIDComponent).entityID,
          callbacks: Object.keys(entityCallbacks).map((cb) => {
            return { label: cb, value: cb as EntityID }
          })
        })
      } else if (e === entity) {
        options.push({
          label: 'Self',
          value: 'Self',
          callbacks: []
        })
      }
      return options
    })
    .flat()
}

/**
 * Returns an options list of entities in the same source
 *
 * @param entity An entity in the same source
 * @returns
 */
export const useNodeOptions = (entity: Entity) => {
  const sourceEntity = UUIDComponent.getSourceEntity(entity)
  const source = UUIDComponent.getAsSourceID(sourceEntity)
  const query = UUIDComponent.getEntitiesBySource(source)
  return query.map((entity) => {
    return {
      label: entity === entity ? 'Self' : getComponent(entity, NameComponent),
      value: entity === entity ? '' : getComponent(entity, UUIDComponent).entityID
    }
  })
}

export type EntityOptionType = { label: string; value: EntityUUID; entity: Entity }

/**
 * Returns a list of authoring layer EntitiyOptionTypes that match the component array filter
 * @param filter
 */
export const useEntityOptions = (filter: bitECS.QueryTerm[]) => {
  const entityOptions = useHookstate<EntityOptionType[]>([])

  // Query all entities
  const filteredEntities = useQuery(filter, Layers.Authoring)

  // Update entity options when entities change
  useEffect(() => {
    // Create options for the Select components
    const options = filteredEntities.map((entity) => {
      const name = hasComponent(entity, NameComponent) ? getComponent(entity, NameComponent) : `Entity ${entity}`

      const entityUUID = hasComponent(entity, UUIDComponent) ? UUIDComponent.get(entity) : (`${entity}` as EntityUUID)

      return {
        label: name,
        value: entityUUID,
        entity
      }
    })

    entityOptions.set(options)
  }, [filteredEntities.length, filter])

  return entityOptions
}
