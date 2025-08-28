import { Entity } from '@ir-engine/ecs'
import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'

interface IExpandedNodes {
  [scene: string]: {
    [entity: Entity]: true
  }
}

export const HierarchyTreeState = defineState({
  name: 'HierarchyTreeState',
  initial: {
    expandedNodes: {} as IExpandedNodes,
    search: { local: '', query: '' },
    firstSelectedEntity: null as Entity | null,
    manualCollapseExpand: false
  },
  extension: syncStateWithLocalStorage(['expandedNodes'])
})
