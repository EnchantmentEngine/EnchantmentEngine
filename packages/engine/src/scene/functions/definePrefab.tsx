import React, { useEffect } from 'react'

import {
  defineComponent,
  deserializeComponent,
  Entity,
  EntityID,
  EntityUUID,
  getComponent,
  SourceID,
  useComponent,
  useHasComponent,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import {
  ActionCreator,
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  MergeObjectSchemas,
  NetworkState,
  NetworkTopics,
  NO_PROXY,
  none,
  Schema,
  Static,
  TObjectSchema,
  TProperties,
  useHookstate,
  useImmediateEffect,
  useMutableState
} from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { SpawnObjectActions } from '@ir-engine/spatial/src/transform/SpawnObjectActions'
import { Quaternion, Vector3 } from 'three'
import { GLTFComponent } from '../../gltf/GLTFComponent'

/**
 * Creates a prefab definition that can be used both statically in scenes and dynamically at runtime.
 *
 * A prefab is a spawnable networked ECS component.
 * This function creates the necessary components, state management, and spawn functionality
 * for a prefab type.
 *
 * @param definition - Definition object
 * @param definition.name - Prefab name
 * @param definition.jsonID - JSON identifier string for serialization/deserialization
 * @param definition.schema - JSON Schema defining the prefab's properties and its types
 * @param definition.reactor - Reactor for component functionality
 *
 * @returns Component: The ECS component for using the prefab in static scenes,
 *  with Component.spawn: The function to spawn the prefab dynamically at runtime.
 *
 * @example
 * // Define a prefab
 * const MyPrefabComponent = definePrefab({
 *   name: 'MyPrefab',
 *   jsonID: 'MY_prefab',
 *   schema: Schema.Object({
 *     name: Schema.String()
 *   }),
 *   reactor: ({ entity }) => {
 *     const prefab = useComponent(entity, MyPrefabComponent)
 *     useEffect(() => {
 *       setComponent(entity, NameComponent, name)
 *     }, [prefab.name])
 *     return null
 *   }
 * })
 *
 * // Spawn dynamically at runtime
 * MyPrefabComponent.spawn({
 *   entityID: 'entity-id',
 *   entitySourceID: 'source-id',
 *   parentUUID: 'parent-id',
 *   position: new Vector3(0, 0, 0),
 *   rotation: new Quaternion(),
 *   name: "Prefab Instance 123"
 * })
 */
export const definePrefab = <P extends TProperties, S extends TObjectSchema<P>>(definition: {
  name: string
  jsonID: string
  schema: S
  reactor?: (props: { entity: Entity }) => null | JSX.Element
}) => {
  const $Actions = {
    spawn: defineAction(
      SpawnObjectActions.spawnObject.extend(
        Schema.Object(definition.schema.properties, { $id: 'ee.engine.prefab_' + definition.name })
      ) as any as MergeObjectSchemas<typeof SpawnObjectActions.spawnObject.schema, S>
      /** @todo types are really broken :( */
    ) as ActionCreator<string, any, any>
  }

  const $State = defineState({
    name: 'ee.engine.prefab_' + definition.name,

    initial: {} as Record<EntityUUID, Static<S>>,

    receptors: {
      onSpawn: $Actions.spawn.receive((action) => {
        getMutableState($State)[
          UUIDComponent.join({ entityID: action.entityID, entitySourceID: action.entitySourceID })
        ].set(Object.fromEntries(Object.keys(definition.schema.properties).map((k: keyof P) => [k, action[k]])))
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
      deserializeComponent(entity, $Component, prefab)
    }, [])
    return null
  }

  /**
   * Spawns a prefab instance dynamically at runtime.
   *
   * This function dispatches both the prefab-specific action and the world network action
   * to create and position the entity in the scene network.
   *
   * @param props - The properties for spawning the prefab
   * @param props.entityUUID - Unique identifier for the entity
   * @param props.parentUUID - Unique identifier of the parent entity
   * @param props.position - The initial position vector
   * @param props.rotation - The initial rotation quaternion
   * @param props.data - The prefab data matching the schema definition
   */
  const spawnPrefab = (
    props: {
      entityID: EntityID
      entitySourceID: SourceID
      parentUUID: EntityUUID
      position: Vector3
      rotation: Quaternion
    } & Static<S>
  ) => {
    const { entityID, entitySourceID, parentUUID, position, rotation, ...data } = props
    dispatchAction(
      $Actions.spawn({
        ...data,
        entityID: props.entityID,
        entitySourceID: props.entitySourceID,
        parentUUID: props.parentUUID,
        position: props.position,
        rotation: props.rotation,
        $network: NetworkState.worldNetwork.id,
        $topic: NetworkTopics.world
      })
    )
  }

  const $Component = defineComponent({
    name: definition.name,
    jsonID: definition.jsonID,

    schema: definition.schema,

    spawn: spawnPrefab,

    action: $Actions.spawn,

    reactor: ({ entity }) => {
      const sourceEntity = UUIDComponent.useSourceEntity(entity)
      const isFromScene = useHasComponent(sourceEntity, GLTFComponent)

      /** If from a scene, we don't need an action as SceneNetworkSystem handles this for us */
      useEffect(() => {
        if (isFromScene) return

        const entityUUIDPair = getComponent(entity, UUIDComponent)

        spawnPrefab({
          entityID: entityUUIDPair.entityID,
          entitySourceID: entityUUIDPair.entitySourceID,
          parentUUID: none,
          position: new Vector3(),
          rotation: new Quaternion(),
          ...getComponent(entity, $Component)
        })
        return () => {
          const entityUUID = UUIDComponent.join(entityUUIDPair)
          dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID }))
        }
      }, [isFromScene])

      if (!definition.reactor) return null
      return <definition.reactor entity={entity} />
    }
  })

  return $Component
}
