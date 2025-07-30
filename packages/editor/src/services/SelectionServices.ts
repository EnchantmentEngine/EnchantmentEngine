import { useEffect } from 'react'

import { EntityUUID, UUIDComponent, entityExists } from '@ir-engine/ecs'
import { LayerID, Layers, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { SelectTagComponent } from '@ir-engine/engine/src/scene/components/SelectTagComponent'
import { defineState, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { HierarchyTreeState } from './HierarchyNodeState'

export const SelectionState = defineState({
  name: 'SelectionState',
  initial: {
    selectedEntities: [] as EntityUUID[]
  },
  updateSelection: (selectedEntities: EntityUUID[]) => {
    getMutableState(HierarchyTreeState).manualCollapseExpand.set(false)
    getMutableState(SelectionState).selectedEntities.set(selectedEntities)
  },
  getSelectedEntities: (layer: LayerID = Layers.Authoring) => {
    return getState(SelectionState).selectedEntities.map((entity) => UUIDComponent.getEntityByUUID(entity, layer))
  },

  useSelectedEntities: (layer: LayerID = Layers.Authoring) => {
    return useHookstate(getMutableState(SelectionState).selectedEntities).value.map((entity) =>
      UUIDComponent.getEntityByUUID(entity, layer)
    )
  }
})

const reactor = () => {
  const selectedEntities = useHookstate(getMutableState(SelectionState).selectedEntities)

  useEffect(() => {
    const entities = [...selectedEntities.value].map((entity) =>
      UUIDComponent.getEntityByUUID(entity, Layers.Authoring)
    )
    for (const entity of entities) {
      if (!entityExists(entity)) continue
      setComponent(entity, SelectTagComponent)
    }

    return () => {
      for (const entity of entities) {
        if (!entityExists(entity)) continue
        removeComponent(entity, SelectTagComponent)
      }
    }
  }, [selectedEntities])

  return null
}

export const EditorSelectionReceptorSystem = defineSystem({
  uuid: 'ee.engine.EditorSelectionReceptorSystem',
  insert: { before: PresentationSystemGroup },
  reactor
})
