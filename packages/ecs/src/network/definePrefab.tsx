import React, { useEffect } from 'react'

import {
  ComponentType,
  defineComponent,
  deserializeComponent,
  Entity,
  entityExists,
  EntityID,
  EntityUUID,
  getComponent,
  serializeComponent,
  SourceID,
  useOptionalComponent,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import {
  deepEqual,
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  NO_PROXY,
  none,
  PeerID,
  Schema,
  useMutableState,
  UserID
} from '@ir-engine/hyperflux'

/**
 * const MyPrefab = definePrefab({
 *   name: 'MyPrefab',
 *   components: [TransformComponent, NameComponent],
 *   reactor: ({ entity }) => {
 *     const name = useComponent(entity, NameComponent)
 *     useEffect(() => {
 *       console.log('MyPrefab name changed:', name)
 *     }, [name])
 *     return null
 *   }
 * })
 *
 * MyPrefab.spawn({
 *   entityID: 'entity-id',
 *   entitySourceID: 'source-id',
 *   parentUUID: 'parent-id',
 *   [NameComponent.jsonID]: {
 *     value: "Prefab Instance 123"
 *   }
 * })
 */
export const definePrefab = <T extends ReturnType<typeof defineComponent>>(definition: {
  name: string
  components: T[]
  reactor?: (props: { entity: Entity }) => JSX.Element | null
}) => {
  const filteredComponents = definition.components.filter((c) => c.jsonID) as ComponentType<any>[]
  const $Actions = {
    spawn: defineAction(
      WorldNetworkAction.spawnEntity.extend(
        Schema.Object(
          {
            components: Object.fromEntries(
              filteredComponents.map((c) => [c.jsonID, Schema.Any() /** @todo proper guard */])
            )
          },
          {
            $id: 'ee.engine.prefab_' + definition.name + '_SPAWN'
          }
        )
      )
    ),
    set: defineAction(
      Schema.Object(
        {
          entityUUID: Schema.String(),
          components: Object.fromEntries(
            filteredComponents.map((c) => [c.jsonID, Schema.Any() /** @todo proper guard */])
          )
        },
        { $id: 'ee.engine.prefab_' + definition.name + '_SET' }
      )
    )
  }

  const $State = defineState({
    name: 'ee.engine.prefab_' + definition.name,

    initial: {} as Record<EntityUUID, Partial<Record<string, any>>>,

    receptors: {
      onSpawn: $Actions.spawn.receive((action) => {
        const entityUUID = UUIDComponent.join({ entityID: action.entityID, entitySourceID: action.entitySourceID })
        const state = getMutableState($State)[entityUUID]
        for (const comp of filteredComponents) {
          if (!(comp.jsonID! in action.components)) continue
          state[comp.jsonID!].merge(
            Object.fromEntries(filteredComponents.map((c) => [c.jsonID, action.components[c.jsonID!]]))
          )
        }
      }),
      onSet: $Actions.set.receive((action) => {
        const state = getMutableState($State)[action.entityUUID]
        for (const comp of filteredComponents) {
          if (!(comp.jsonID! in action.components)) continue
          state[comp.jsonID!].merge(
            Object.fromEntries(filteredComponents.map((c) => [c.jsonID, action.components[c.jsonID!]]))
          )
        }
      }),
      onRemove: WorldNetworkAction.destroyEntity.receive((action) => {
        getMutableState($State)[action.entityUUID].set(none)
      })
    },

    reactor: () => {
      const state = useMutableState($State)
      return (
        <>
          {state.keys.map((entityUUID: EntityUUID) => (
            <EntityExistsReactor key={entityUUID} entityUUID={entityUUID} />
          ))}
        </>
      )
    }
  })

  const EntityExistsReactor = (props: { entityUUID: EntityUUID }) => {
    const entity = UUIDComponent.useEntityByUUID(props.entityUUID)
    if (!entity) return null
    return <EntityReadyReactor entityUUID={props.entityUUID} />
  }

  const EntityReadyReactor = (props: { entityUUID: EntityUUID }) => {
    /** Suspend context until entity exists */
    const entity = UUIDComponent.useEntityByUUID(props.entityUUID)
    useEffect(() => {
      // If the entity is removed externally, remove it from the network
      return () => {
        if (!entityExists(entity) && getState($State)[props.entityUUID]) {
          dispatchAction(
            WorldNetworkAction.destroyEntity({
              entityUUID: props.entityUUID
            })
          )
        }
      }
    }, [])

    const state = useMutableState($State)[props.entityUUID].get(NO_PROXY)
    filteredComponents.forEach((c) => {
      useEffect(() => {
        deserializeComponent(entity, c, state[c.jsonID!])
      }, [entity, c, state[c.jsonID!]])
      const component = useOptionalComponent(entity, c)
      useEffect(() => {
        if (!component) return
        const data = serializeComponent(entity, c)
        if (!deepEqual(state, data)) {
          set(entity, { [c.jsonID!]: data })
        }
      }, [component])
    })
    return definition.reactor ? <definition.reactor entity={entity} /> : null
  }

  const spawn = (args: {
    entityID: EntityID
    entitySourceID: SourceID
    parentUUID: EntityUUID
    ownerID?: UserID
    authorityPeerID?: PeerID
    components: Partial<Record<(typeof filteredComponents)[number]['jsonID'], any>>
  }) => {
    dispatchAction(
      $Actions.spawn({
        ...args.components,
        ownerID: args.ownerID,
        authorityPeerId: args.authorityPeerID,
        entityID: args.entityID,
        entitySourceID: args.entitySourceID,
        parentUUID: args.parentUUID
      })
    )
  }

  const set = (entity: Entity, data: Partial<Record<(typeof filteredComponents)[number]['jsonID'], any>>) => {
    if (!entityExists(entity)) return console.warn('Tried to set prefab data on non-existing entity')
    dispatchAction(
      $Actions.set({
        entityUUID: UUIDComponent.get(entity),
        components: data
      })
    )
  }

  const remove = (entity: Entity) => {
    const entityUUIDPair = getComponent(entity, UUIDComponent)
    const entityUUID = UUIDComponent.join(entityUUIDPair)
    dispatchAction(
      WorldNetworkAction.destroyEntity({
        entityUUID
      })
    )
  }

  return { spawn, set, remove }
}

/*
const MyPrefab = definePrefab({
  name: 'MyPrefab',
  components: [TransformComponent, NameComponent],
  reactor: ({ entity }) => {
    const name = useComponent(entity, NameComponent)
    useEffect(() => {
      console.log('MyPrefab name changed:', name)
    }, [name])
    return null
  }
})

MyPrefab.spawn({
  entityID: 'entity-id' as EntityID,
  entitySourceID: 'source-id' as SourceID,
  parentUUID: 'parent-id' as EntityUUID,
  components: {
    [NameComponent.jsonID]: {
      value: 'Prefab Instance 123'
    }
  }
})

MyPrefab.set(
  UUIDComponent.getEntityByUUID(
    UUIDComponent.join({ entityID: 'entity-id' as EntityID, entitySourceID: 'source-id' as SourceID })
  )!,
  {
    [NameComponent.jsonID]: {
      value: 'New Name'
    }
  }
)

MyPrefab.remove(
  UUIDComponent.getEntityByUUID(
    UUIDComponent.join({ entityID: 'entity-id' as EntityID, entitySourceID: 'source-id' as SourceID })
  )!
)*/
