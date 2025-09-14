import React from 'react'

import {
  Component,
  deserializeComponent,
  EntityID,
  EntityUUID,
  matchesEntityID,
  matchesEntitySourceID,
  SerializedComponentType,
  SourceID,
  useComponent,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import {
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  matches,
  NetworkState,
  NetworkTopics,
  NO_PROXY,
  none,
  useHookstate,
  useImmediateEffect,
  useMutableState,
  Validator
} from '@ir-engine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { TransformComponent } from './components/TransformComponent'

/**
 * Creates an object definition that can be used both statically in scenes and dynamically at runtime.
 *
 * An object is a predefined set of networked ECS components.
 * This function creates the necessary components, state management, and spawn functionality
 * for an object type.
 *
 * @param definition - Definition object
 * @param definition.name - Object name
 * @param definition.components - Array of ECS components that make up the object
 * @param definition.reactor - Optional reactor for component functionality
 *
 * @returns Component: The ECS component for using the object in static scenes,
 *  with Component.spawn: The function to spawn the object dynamically at runtime.
 *
 * @example
 * // Define an object
 * const MyObjectDefinition = defineObject({
 *   name: 'MyObject',
 *   components: [TransformComponent, NameComponent] as const,
 *   reactor: ({ uuid }) => {
 *   const entity = UUIDComponent.useEntityByUUID(uuid)!
 *     useEffect(() => {
 *       setComponent(entity, NameComponent, name)
 *     }, [entity])
 *     return null
 *   }
 * })
 *
 * // Spawn dynamically at runtime
 * MyObjectDefinition.spawn({
 *   entityUUID: 'unique-id',
 *   parentUUID: 'parent-id',
 *   [NameComponent.jsonID]: { name: "Object Instance 123" },
 *   [TransformComponent.jsonID]: { position: new Vector3(), rotation: new Quaternion(), scale: new Vector3(1, 1, 1) }
 * })
 */
export const defineObject = <C extends Component>(definition: {
  name: string
  components: C[]
  reactor?: (props: { uuid: EntityUUID }) => null | JSX.Element
}) => {
  const filteredComponents = definition.components.filter((c) => typeof c.jsonID === 'string')
  type S = {
    [K in (typeof filteredComponents)[number] as K extends { jsonID: string }
      ? K['jsonID']
      : never]: SerializedComponentType<K>
  }

  const $Actions = {
    spawn: defineAction({
      /** @todo once actions use JSON Schemas, we can include that strictness here */
      // ...(Object.fromEntries(filteredComponents.map((c) => [c.jsonID, matches.object])) as Record<
      //   keyof S,
      //   Validator<unknown, S[keyof S]>
      // >),
      type: 'ee.spatial.object_' + definition.name,
      components: matches.object as Validator<unknown, any>,
      entityID: matchesEntityID,
      entitySourceID: matchesEntitySourceID
    })
  }

  const $State = defineState({
    name: 'ee.spatial.object_' + definition.name,

    initial: {} as Record<EntityUUID, S>,

    receptors: {
      onSpawn: $Actions.spawn.receive((action) => {
        getMutableState($State)[
          UUIDComponent.join({ entityID: action.entityID, entitySourceID: action.entitySourceID })
        ].set(
          Object.fromEntries(filteredComponents.map((k) => [k.jsonID, action.components[k.jsonID as keyof S]])) as S
        )
      }),
      onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
        getMutableState($State)[action.entityUUID].set(none)
      })
    },

    reactor: () => {
      const prefabState = useMutableState($State)
      return (
        <>
          {prefabState.keys.map((entityUUID: EntityUUID) => (
            <EntityExistsReactor key={entityUUID} entityUUID={entityUUID} />
          ))}
        </>
      )
    }
  })

  const EntityExistsReactor = (props: { entityUUID: EntityUUID }) => {
    /** Suspend context until entity exists */
    const entity = UUIDComponent.useEntityByUUID(props.entityUUID)
    if (!entity) return null
    return <EntityReadyReactor entityUUID={props.entityUUID} />
  }

  const EntityReadyReactor = (props: { entityUUID: EntityUUID }) => {
    /** Suspend context until entity exists */
    const entity = UUIDComponent.useEntityByUUID(props.entityUUID)
    useComponent(entity, TransformComponent)
    const prefab = useHookstate(getMutableState($State)[props.entityUUID]).get(NO_PROXY)
    useImmediateEffect(() => {
      for (const $Component of filteredComponents) {
        deserializeComponent(entity, $Component, prefab[$Component.jsonID])
      }
    }, [])
    if (!definition.reactor) return null
    return <definition.reactor uuid={props.entityUUID} />
  }

  const spawnPrefab = (props: { entityID: EntityID; entitySourceID: SourceID; parentUUID: EntityUUID } & S) => {
    const { entityID, entitySourceID, parentUUID, ...rest } = props
    dispatchAction(
      $Actions.spawn({
        /** @todo fix when actions use JSON Schemas */
        // ...(Object.fromEntries(filteredComponents.map((c) => [c.jsonID, props[c.jsonID as keyof S]])) as S),
        components: rest as any,
        entityID,
        entitySourceID,
        $network: NetworkState.worldNetwork.id,
        $topic: NetworkTopics.world
      })
    )
  }

  return {
    spawn: spawnPrefab,
    state: $State
  }
}

const ObjectDefinition = defineObject({
  name: 'Box',
  components: [TransformComponent] as const
})

ObjectDefinition.spawn
ObjectDefinition.state._TYPE

ObjectDefinition.spawn({
  entityID: 'box1' as EntityID,
  entitySourceID: 'root' as SourceID,
  parentUUID: 'ground' as EntityUUID,
  // IR_transform: { position: { x: 0, y: 1, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } }
  // IR_transform: { position: new Vector3(), rotation: new Quaternion(), scale: new Vector3(1, 1, 1) },
  [TransformComponent.jsonID]: { position: new Vector3(), rotation: new Quaternion(), scale: new Vector3(1, 1, 1) }
})
