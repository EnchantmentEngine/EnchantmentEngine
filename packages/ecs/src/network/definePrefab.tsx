import React, { useEffect } from 'react'

import {
  ActionOptions,
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  NO_PROXY,
  none,
  PeerID,
  ScenePeer,
  SceneUser,
  Schema,
  useHookstate,
  useMutableState,
  UserID
} from '@ir-engine/hyperflux'
import {
  Component,
  deserializeComponent,
  entityExists,
  getComponent,
  serializeComponent,
  SetComponentType
} from '../ComponentFunctions'
import { Entity, EntityID, EntityUUID, SourceID } from '../Entity'
import { QueryReactor } from '../QueryFunctions'
import { defineSystem } from '../SystemFunctions'
import { PresentationSystemGroup } from '../SystemGroups'
import { UUIDComponent } from '../UUIDComponent'
import { EntityNetworkState } from './EntityNetworkState'
import { WorldNetworkAction } from './WorldNetworkAction'

export const PrefabRegistry: Record<string, unknown> = {}

/**
 * Define a prefab, which is a reusable collection of components that can be spawned as an entity.
 * Prefabs can be spawned via the `spawn` method, and their components can be updated via the `set` method.
 * They can be removed via the `remove` method.
 *
 * @param definition The prefab definition, including its name, components, and optional reactor.
 * @returns An object with `spawn`, `set`, and `remove` methods to manage prefab instances.
 *
 * @example
 * const MyPrefab = definePrefab({
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
 *   [NameComponent.jsonID]: "Prefab Instance 123"
 * })
 */
export function definePrefab<T extends readonly Component[]>(definition: {
  components: T
  reactor?: (props: { entity: Entity }) => JSX.Element | null
}) {
  /**
   * Strong types for the components payload: values must match one of the SetComponentType of the provided components.
   * Keys are jsonID strings at runtime; we can't narrow them statically due to Component.jsonID typing, but we still
   * enforce value shapes via a union of allowed SetComponentType values.
   */
  // Extract literal jsonID even when optional and drop widened `string` from unions
  type LiteralString<T> = T extends string ? (string extends T ? never : T) : never
  type ExtractLiteralID<C> = LiteralString<NonNullable<C extends { jsonID?: any } ? C['jsonID'] : never>>
  type ByIDMap = {
    [C in T[number] as ExtractLiteralID<C>]: C
  }
  type PrefabComponentsRecord = {
    [K in keyof ByIDMap]?: ByIDMap[K] extends Component ? SetComponentType<ByIDMap[K]> | true : never
  }
  type AllowedKeys = keyof ByIDMap & string
  type ValidateComponents<C extends Record<string, unknown>> = {
    [K in keyof C]: K extends AllowedKeys
      ? ByIDMap[K & AllowedKeys] extends Component
        ? SetComponentType<ByIDMap[K & AllowedKeys]> | true
        : never
      : never
  }
  type ResolvedPrefabComponents = {
    [K in keyof ByIDMap]?: ByIDMap[K] extends Component ? SetComponentType<ByIDMap[K]> : never
  }

  const componentsArray = [...(definition.components as readonly Component[])] as Component[]
  const filteredComponents = componentsArray.filter((c) => c.jsonID) as Component[]

  const uniqueKey = filteredComponents
    .map((c) => c.jsonID)
    .sort()
    .join('|')
  if (PrefabRegistry[uniqueKey]) throw new Error(`Prefab with components [${uniqueKey}] already defined`)

  const $Actions = {
    set: defineAction(
      Schema.Object(
        {
          entityUUID: Schema.String(),
          components: Object.fromEntries(
            filteredComponents.map((c) => [c.jsonID, Schema.Optional(c.schema ?? Schema.Literal(true))])
          )
        },
        { $id: 'ee.engine.prefab_' + uniqueKey + '_SET' }
      )
    )
  }

  const $State = defineState({
    name: 'ee.engine.prefab_' + uniqueKey,

    initial: {} as Record<EntityUUID, ResolvedPrefabComponents>,

    receptors: {
      onSet: $Actions.set.receive((action) => {
        const entityUUID = action.entityUUID
        if (!getState($State)[entityUUID]) getMutableState($State)[entityUUID].set({})
        const state = getMutableState($State)[entityUUID]
        for (const comp of filteredComponents) {
          if (!(comp.jsonID! in action.components)) continue
          if (!state[comp.jsonID!]) state[comp.jsonID!].set({})
          state[comp.jsonID!].merge(action.components[comp.jsonID!])
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
      /** @todo figure out how to include only non-default properties */
      // const component = useOptionalComponent(entity, c)
      // useEffect(() => {
      //   if (!component) return
      //   const data = serializeComponent(entity, c)
      //   if (!deepEqual(state[c.jsonID!], data)) {
      //     set(entity, { [c.jsonID!]: data })
      //   }
      // }, [component])
    })
    return definition.reactor ? <definition.reactor entity={entity} /> : null
  }

  const spawn = <C extends Record<string, unknown>>(
    args: {
      entityID: EntityID
      entitySourceID: SourceID
      parentUUID: EntityUUID
      ownerID?: UserID
      authorityPeerID?: PeerID
      components: ValidateComponents<C>
    } & ActionOptions
  ) => {
    const { entityID, entitySourceID, parentUUID, ownerID, authorityPeerID, components, ...other } = args
    dispatchAction(
      WorldNetworkAction.spawnEntity({
        ...other,
        entityID,
        entitySourceID,
        parentUUID,
        ownerID,
        authorityPeerId: authorityPeerID
      })
    )
    dispatchAction(
      $Actions.set({
        entityUUID: UUIDComponent.join({ entityID, entitySourceID }),
        components
      })
    )
  }

  const set = <C extends Record<string, unknown>>(entity: Entity, data: ValidateComponents<C>) => {
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

  /** Use a system reactor to detect prefabs from the scene that need to be networked based on queries matching the components */
  const InternalQuerySystem = defineSystem({
    uuid: 'ee.engine.prefab_' + uniqueKey + '_system',
    insert: { after: PresentationSystemGroup },
    reactor: () => <QueryReactor Components={filteredComponents} ChildEntityReactor={SceneNetworkReactor} />
  })

  const SceneNetworkReactor = (props: { entity: Entity }) => {
    const entityUUID = UUIDComponent.use(props.entity)
    const entityNetworkState = useHookstate(getMutableState(EntityNetworkState)[entityUUID]).value

    if (!entityNetworkState) return null

    return <SpawnedFromSceneReactor entity={props.entity} />
  }

  const SpawnedFromSceneReactor = (props: { entity: Entity }) => {
    const { entity } = props

    useEffect(() => {
      const state = getState($State)
      const entityUUIDPair = getComponent(entity, UUIDComponent)
      const entityUUID = UUIDComponent.join(entityUUIDPair)
      if (state[entityUUID]) return // already spawned
      const componentsData: ValidateComponents<PrefabComponentsRecord> = {} as any
      for (const comp of filteredComponents) {
        const compData = serializeComponent(entity, comp)
        componentsData[comp.jsonID!] = compData ?? true
      }

      dispatchAction(
        $Actions.set({
          entityUUID: UUIDComponent.get(entity),
          components: componentsData,
          $network: undefined,
          $topic: undefined,
          $user: SceneUser,
          $peer: ScenePeer
        })
      )
    }, [])

    return null
  }

  const API = { spawn, set, remove, $State, $Actions, $System: InternalQuerySystem }

  PrefabRegistry[uniqueKey] = API

  return API
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
    [NameComponent.jsonID]: 'Prefab Instance 123'
  }
})

MyPrefab.set(
  UUIDComponent.getEntityByUUID(
    UUIDComponent.join({ entityID: 'entity-id' as EntityID, entitySourceID: 'source-id' as SourceID })
  )!,
  {
    [NameComponent.jsonID]: 'New Name'
  }
)

MyPrefab.remove(
  UUIDComponent.getEntityByUUID(
    UUIDComponent.join({ entityID: 'entity-id' as EntityID, entitySourceID: 'source-id' as SourceID })
  )!
)*/
