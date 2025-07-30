import { createSimpleStore, useSimpleStore } from '@ir-engine/hyperflux'
import { v4 as uuidv4 } from 'uuid'
import {
  LayerComponent,
  LayerID,
  Layers,
  createEntity,
  defineComponent,
  getComponent,
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from './ComponentFunctions'
import { Entity, EntityID, EntityUUID, EntityUUIDPair, SourceID, UndefinedEntity } from './Entity'
import { S } from './schemas/JSONSchemas'

/**
 * SimpleStore instances for each layer - EntitiesBySource
 */
export const EntitiesBySourceStores = new Map<
  LayerID,
  ReturnType<typeof createSimpleStore<Record<SourceID, Entity[]>>>
>()

/**
 * SimpleStore instances for each layer - EntitiesByUUID
 */
export const EntitiesByUUIDStores = new Map<LayerID, ReturnType<typeof createSimpleStore<Record<EntityUUID, Entity>>>>()

/**
 * Get or create EntitiesBySource store for a layer
 */
function getEntitiesBySourceStore(layer: LayerID) {
  if (!EntitiesBySourceStores.has(layer)) {
    EntitiesBySourceStores.set(
      layer,
      createSimpleStore({} as Record<SourceID, Entity[]>, `ir.world.EntitiesBySourceState.${layer}`)
    )
  }
  return EntitiesBySourceStores.get(layer)!
}

/**
 * Get or create EntitiesByUUID store for a layer
 */
function getEntitiesByUUIDStore(layer: LayerID) {
  if (!EntitiesByUUIDStores.has(layer)) {
    EntitiesByUUIDStores.set(
      layer,
      createSimpleStore({} as Record<EntityUUID, Entity>, `ir.ecs.EntitiesByUUIDState.${layer}`)
    )
  }
  return EntitiesByUUIDStores.get(layer)!
}

/**
 * UUIDComponent provides a unique identifier for entities by combining a source ID and an entity ID.
 *
 * The component stores an {@link EntityUUIDPair} which consists of:
 * - entitySourceID: Identifies the source/context of the entity (e.g., a model, scene, or avatar)
 * - entityID: Identifies the entity uniquely within that source context
 *
 * This split structure allows for:
 * - Deterministic entity creation across network peers
 * - Hierarchical relationships between entities from the same source
 * - Efficient entity lookup within a specific source context
 * - Consistent entity references across different layers (simulation, authoring)
 *
 * The full unique ID is created by concatenating these two parts, ensuring uniqueness across the
 * engine runtime while maintaining the relationship between entities from the same source.
 *
 * A full unique ID can be used as a source ID for other entities, using the {@link UUIDComponent.getAsSourceID} method.
 *
 * @property {SourceID} entitySourceID Identifies the source/context of the entity
 * @property {EntityID} entityID Identifies the entity uniquely within that source context
 */
export const UUIDComponent = defineComponent({
  name: 'UUIDComponent',

  jsonID: 'EE_uuid',

  schema: S.EntityUUIDPair({
    validate: (idPair, prev, entity) => {
      if (idPair === prev) return true
      if (!idPair.entitySourceID) {
        console.error('UUID context cannot be empty')
        return false
      }
      if (!idPair.entityID) {
        console.error('UUID id cannot be empty')
        return false
      }
      const uuid = UUIDComponent.join(idPair)
      const layer = LayerComponent.get(entity)
      const uuidStore = getEntitiesByUUIDStore(layer)
      const currentState = uuidStore.get()
      if (!currentState[uuid]) {
        return true
      }
      // throw error if uuid is already in use
      const currentEntity = currentState[uuid]
      if (currentEntity && currentEntity !== entity) {
        console.error(`UUID ${uuid} is already in use`, currentEntity, entity)
        return false
      }

      return true
    },
    required: true
  }),

  toJSON(component) {
    return { entityID: component.entityID }
  },

  onSet(entity, component, idPair: EntityUUIDPair) {
    if (!idPair.entitySourceID) throw new Error('UUID context cannot be empty')
    if (!idPair.entityID) throw new Error('UUID id cannot be empty')

    const layer = LayerComponent.get(entity)
    const prev = component.entityID && component.entitySourceID ? UUIDComponent.join(component) : undefined
    // remove old uuid
    if (prev) {
      UUIDComponent.onRemove(entity, component)
    }

    // set new uuid
    const uuid = UUIDComponent.join(idPair)
    UUIDComponentFunctions._getUUIDState(uuid, layer)
    const uuidStore = getEntitiesByUUIDStore(layer)
    uuidStore[uuid] = entity
    uuidStore.set(uuidStore)

    component.entityID = idPair.entityID
    component.entitySourceID = idPair.entitySourceID

    const sourceStore = getEntitiesBySourceStore(layer)
    const currentState = sourceStore.value
    const entitiesBySourceState = currentState[idPair.entitySourceID]
    if (!entitiesBySourceState) {
      currentState[idPair.entitySourceID] = [entity]
      sourceStore.set(currentState)
    } else {
      if (!entitiesBySourceState.includes(entity)) {
        currentState[idPair.entitySourceID] = [...entitiesBySourceState, entity]
        sourceStore.set(currentState)
      }
    }
  },

  onRemove: (entity, component) => {
    const uuid = UUIDComponent.join(component)
    const layer = LayerComponent.get(entity)
    const uuidStore = getEntitiesByUUIDStore(layer)
    const currentUUIDState = uuidStore.value
    if (currentUUIDState[uuid]) {
      delete currentUUIDState[uuid]
      uuidStore.set(currentUUIDState)
    }

    const source = component.entitySourceID.toString() as SourceID
    const sourceStore = getEntitiesBySourceStore(layer)
    const currentSourceState = sourceStore.value
    const entities = currentSourceState[source]?.filter((currentEntity) => currentEntity !== entity) || []
    if (entities.length === 0) {
      delete currentSourceState[source]
    } else {
      currentSourceState[source] = entities
    }
    sourceStore.set(currentSourceState)
  },

  entitiesByUUIDState: {} as Record<LayerID, Record<EntityUUID, Entity>>,

  create: (sourceEntity: Entity, nodeID = UUIDComponent.generate(), layer = Layers.Simulation as LayerID) => {
    const entity = createEntity(layer)
    setComponent(entity, UUIDComponent, {
      entitySourceID: UUIDComponent.getAsSourceID(sourceEntity),
      entityID: nodeID
    })
    return entity
  },

  /** Reactively gets an entity by UUID */
  useEntityByUUID(uuid: EntityUUID, layer = Layers.Simulation as LayerID) {
    const uuidStore = getEntitiesByUUIDStore(layer)
    const [uuidState] = useSimpleStore(uuidStore)
    return uuidState[uuid] || UndefinedEntity
  },

  /** Gets an entity by UUID */
  getEntityByUUID(uuid: EntityUUID, layer = Layers.Simulation as LayerID) {
    return UUIDComponentFunctions._getUUIDState(uuid, layer)
  },

  /** Gets an entity from the same source by ID */
  getEntityFromSameSourceByID(entity: Entity, id: EntityID, layer = Layers.Simulation as LayerID) {
    const entitySourceID = getComponent(entity, UUIDComponent).entitySourceID

    return UUIDComponent.getEntityByUUID(UUIDComponent.join({ entitySourceID, entityID: id }), layer)
  },

  /** Reactively gets an entity from the same source by ID */
  useEntityFromSameSourceByID(entity: Entity, id: EntityID, layer = Layers.Simulation as LayerID) {
    const entitySourceID = useComponent(entity, UUIDComponent).entitySourceID

    return UUIDComponent.useEntityByUUID(UUIDComponent.join({ entitySourceID, entityID: id }), layer)
  },

  setSourceEntity(entity: Entity, source: Entity) {
    const sourceID = getComponent(source, UUIDComponent).entitySourceID
    const entityID = getComponent(entity, UUIDComponent).entityID
    setComponent(entity, UUIDComponent, { entitySourceID: sourceID, entityID })
  },

  getSourceEntity(entity: Entity) {
    const layer = LayerComponent.get(entity)
    const entitySourceID = getComponent(entity, UUIDComponent).entitySourceID as any as EntityUUID

    return UUIDComponent.getEntityByUUID(entitySourceID, layer)
  },

  useSourceEntity(entity: Entity) {
    const layer = LayerComponent.get(entity)
    const entitySourceID = useComponent(entity, UUIDComponent).entitySourceID as any as EntityUUID

    return UUIDComponent.useEntityByUUID(entitySourceID, layer)
  },

  useEntitiesBySource: (sourceID: SourceID, layer = Layers.Simulation as LayerID) => {
    const sourceStore = getEntitiesBySourceStore(layer)
    const [sourceState] = useSimpleStore(sourceStore)
    return sourceState?.[sourceID] || []
  },

  getEntitiesBySource: (sourceID: SourceID, layer = Layers.Simulation as LayerID): Entity[] => {
    const sourceStore = getEntitiesBySourceStore(layer)
    return sourceStore.value[sourceID] || []
  },

  /** Recursively get the source entity until the root source is found */
  getRootSource: (entity: Entity) => {
    if (!hasComponent(entity, UUIDComponent)) return UndefinedEntity
    const sourceEntity = UUIDComponent.getSourceEntity(entity)
    if (!sourceEntity || sourceEntity === entity) return entity
    return UUIDComponent.getRootSource(sourceEntity)
  },

  /** Construct a new SourceID from the concatenated values of the source entity */
  getAsSourceID: (entity: Entity) => UUIDComponent.join(getComponent(entity, UUIDComponent)) as any as SourceID,

  useAsSourceID: (entity: Entity) => {
    const uuidComponent = useOptionalComponent(entity, UUIDComponent)
    return uuidComponent ? (UUIDComponent.join(uuidComponent) as any as SourceID) : ('' as SourceID)
  },

  /** Gets a UUID as a string */
  get: (entity: Entity) => UUIDComponent.join(getComponent(entity, UUIDComponent)),

  /** Reactively gets a UUID as a string */
  use: (entity: Entity) => UUIDComponent.join(useComponent(entity, UUIDComponent)),

  /** Joins an EntityUUIDPair into a string */
  join: (idPair: EntityUUIDPair) => `${idPair.entitySourceID}${idPair.entityID}` as EntityUUID,
  /** @deprecated use UUIDComponent.generate() instead */
  generateUUID() {
    return UUIDComponent.generate()
  },

  /** Generates a new UUID */
  generate() {
    return uuidv4() as EntityID
  }
})

function _getUUIDState(uuid: EntityUUID, layer = Layers.Simulation as LayerID) {
  const uuidStore = getEntitiesByUUIDStore(layer)
  const state = uuidStore.value

  let entityState = state[uuid]
  if (!entityState) {
    entityState = UndefinedEntity
    state[uuid] = entityState
    uuidStore.set(state)
  }
  return entityState
}

export const UUIDComponentFunctions = {
  /** @private Exposed only for unit tests */
  _getUUIDState
}
