import { getMutableState, getState, HyperFlux } from '@ir-engine/hyperflux'
import * as bitECS from 'bitecs'
import { setComponent } from './ComponentFunctions'
import { Entity } from './Entity'
import { EntityLayerState, LayerID } from './LayerState'
import { SimulationLayerTagComponent } from './SimulationLayerTagComponent'

export const createEntity = (layerID: LayerID = 'simulation' as LayerID): Entity => {
  const result = bitECS.addEntity(HyperFlux.store) as Entity
  //iterates through layer relations for this layer, creates corresponding entities in those layers depending on relation type
  const layer = getState(EntityLayerState).layers[layerID]
  const linkedEntityObject = {} as Record<LayerID, Entity>
  linkedEntityObject[layerID] = result
  const layerState = getMutableState(EntityLayerState)
  layerState.entityLayerMap[result].set(layerID)
  layerState.linkedEntities[result].set(linkedEntityObject)
  for (const dstLayerID in layer.relations) {
    //for each relation, create an entity in the corresponding layer
    const relationType = layer.relations[dstLayerID]
    if (relationType === 'propagate') {
      const layerEntity = createEntity(dstLayerID as LayerID)
      linkedEntityObject[dstLayerID] = layerEntity
      layerState.linkedEntities[layerEntity].set(linkedEntityObject)
    }
  }
  if (layerID === 'simulation') {
    setComponent(result, SimulationLayerTagComponent)
  }
  if (layerID === 'simulation') {
    setComponent(result, SimulationLayerTagComponent)
  }
  return result
}
