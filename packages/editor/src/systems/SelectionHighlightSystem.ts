import { hasComponent, removeComponent, setComponent, traverseEntityNode } from '@ir-engine/ecs'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { HighlightComponent } from '@ir-engine/spatial/src/renderer/components/HighlightComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { useEffect } from 'react'
import { SelectionState } from '../services/SelectionServices'

const reactor = () => {
  const selectedEntities = SelectionState.useSelectedEntities()

  useEffect(() => {
    if (!selectedEntities) return
    const prevSelectedEntities = selectedEntities
    if (!prevSelectedEntities) return
    for (const entity of prevSelectedEntities) {
      setComponent(entity, HighlightComponent)
      traverseEntityNode(entity, (child) => {
        if (hasComponent(child, MeshComponent) && hasComponent(child, VisibleComponent))
          setComponent(child, HighlightComponent)
      })
    }
    return () => {
      for (const entity of prevSelectedEntities) {
        removeComponent(entity, HighlightComponent)
        traverseEntityNode(entity, (childEntity) => {
          removeComponent(childEntity, HighlightComponent)
        })
      }
    }
  }, [selectedEntities])

  return null
}

export const SelectionHighlightSystem = defineSystem({
  uuid: 'ir.editor.HighlightSystem',
  insert: { with: AnimationSystemGroup },
  reactor
})
