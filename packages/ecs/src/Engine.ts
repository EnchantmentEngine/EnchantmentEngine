import * as bitECS from 'bitecs'
import { getAllEntities } from 'bitecs'

import * as Hyperflux from '@ir-engine/hyperflux'
import {
  createHyperStore,
  getState,
  HyperFlux,
  HyperStore,
  NO_PROXY_STEALTH,
  stopAllReactors
} from '@ir-engine/hyperflux'

import { $RemovedComponent, removeEntity } from './ComponentFunctions'
import { ECSState } from './ECSState'
import { EngineState } from './EngineState'
import { Entity } from './Entity'
import { queries, removeQuery } from './QueryFunctions'
import { SystemState } from './SystemState'
import { EntitiesBySourceStores, EntitiesByUUIDStores } from './UUIDComponent'

export class Engine {
  static instance: Engine

  /**
   * @deprecated use "getState(EngineState).userID" instead
   * The uuid of the logged-in user
   */
  get userID() {
    return getState(EngineState).userID
  }

  store: HyperStore

  /**
   * Represents the reference space of the xr session local floor.
   * @deprecated use "getState(ReferenceSpaceState).localFloorEntity" instead
   */
  get localFloorEntity() {
    return Engine.instance.store.stateMap['ReferenceSpaceState'].get(NO_PROXY_STEALTH).localFloorEntity as Entity
  }

  /**
   * Represents the reference space for the absolute origin of the rendering context.
   * @deprecated use "getState(ReferenceSpaceState).originEntity" instead
   */
  get originEntity() {
    return Engine.instance.store.stateMap['ReferenceSpaceState'].get(NO_PROXY_STEALTH).originEntity as Entity
  }

  /**
   * Represents the reference space for the viewer.
   * @deprecated use "getState(ReferenceSpaceState).viewerEntity" instead
   */
  get viewerEntity() {
    return Engine.instance.store.stateMap['ReferenceSpaceState'].get(NO_PROXY_STEALTH).viewerEntity as Entity
  }

  /** @deprecated use viewerEntity instead */
  get cameraEntity() {
    return this.viewerEntity
  }
}

globalThis.Engine = Engine
globalThis.Hyperflux = Hyperflux

export function createEngine(hyperstore = createHyperStore()) {
  if (Engine.instance) throw new Error('Store already exists')
  Engine.instance = new Engine()
  hyperstore.getCurrentReactorRoot = () =>
    getState(SystemState).activeSystemReactors.get(getState(SystemState).currentSystemUUID)
  hyperstore.getDispatchTime = () => getState(ECSState).simulationTime
  hyperstore.getAgentID = () => getState(EngineState).userID
  Engine.instance.store = bitECS.createWorld(hyperstore) as HyperStore
  const UndefinedEntity = bitECS.addEntity(hyperstore)
}

export function destroyEngine() {
  /** Clear timer */
  getState(ECSState).timer?.clear()

  try {
    /** Remove all entities */
    const entities = getAllEntities(HyperFlux.store) as Entity[]
    for (const entity of entities) removeEntity(entity)
  } catch (e) {
    //some errors are thrown because we have side effects in component onRemove - we need to move that logic to reactors
  }

  EntitiesBySourceStores.clear()
  EntitiesByUUIDStores.clear()

  $RemovedComponent.exists.fill(0)

  /** Remove all queries */
  for (const query of queries) {
    removeQuery(query)
  }

  /** Stop all reactors */
  stopAllReactors()

  /** Remove world */
  bitECS.deleteWorld(HyperFlux.store)

  /** Dereference store */
  HyperFlux.store = null!

  /** Dereference engine */
  Engine.instance = null!
}
