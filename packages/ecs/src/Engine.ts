import * as bitECS from 'bitecs'
import { getAllEntities } from 'bitecs'

import { createHyperStore, getState, HyperFlux, HyperStore, stopAllReactors } from '@ir-engine/hyperflux'

import { $RemovedComponent, removeEntity } from './ComponentFunctions'
import { ECSState } from './ECSState'
import { EngineState } from './EngineState'
import { Entity } from './Entity'
import { queries, removeQuery } from './QueryFunctions'
import { SystemState } from './SystemState'
import { EntitiesBySourceStores, EntitiesByUUIDStores } from './UUIDComponent'

globalThis.HyperStore = HyperFlux.store

export function createEngine() {
  if (HyperFlux.store) throw new Error('Store already exists')
  const hyperstore = createHyperStore()
  hyperstore.getCurrentReactorRoot = () =>
    getState(SystemState).activeSystemReactors.get(getState(SystemState).currentSystemUUID)
  hyperstore.getDispatchTime = () => getState(ECSState).simulationTime
  hyperstore.getAgentID = () => getState(EngineState).userID
  HyperFlux.store = bitECS.createWorld(hyperstore) as HyperStore
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
}
