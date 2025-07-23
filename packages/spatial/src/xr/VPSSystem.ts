import { getComponent, getMutableComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { defineActionQueue } from '@ir-engine/hyperflux'

import { TransformComponent } from '../transform/components/TransformComponent'
import { PersistentAnchorActions, PersistentAnchorComponent } from './XRAnchorComponents'
import { XRPersistentAnchorSystem } from './XRPersistentAnchorSystem'

const vpsAnchorQuery = defineQuery([PersistentAnchorComponent])
const vpsAnchorFoundQueue = defineActionQueue(PersistentAnchorActions.anchorFound.matches)
const vpsAnchorUpdatedQueue = defineActionQueue(PersistentAnchorActions.anchorUpdated.matches)
const vpsAnchorLostQueue = defineActionQueue(PersistentAnchorActions.anchorLost.matches)

const execute = () => {
  const anchors = vpsAnchorQuery()

  for (const action of vpsAnchorFoundQueue()) {
    for (const entity of anchors) {
      const anchor = getMutableComponent(entity, PersistentAnchorComponent)
      if (anchor.name.value === action.name) {
        anchor.active.set(true)
        const transform = getComponent(entity, TransformComponent)
        transform.position.copy(action.position)
        transform.rotation.copy(action.rotation)
      }
    }
  }

  for (const action of vpsAnchorUpdatedQueue()) {
    for (const entity of anchors) {
      const anchor = getMutableComponent(entity, PersistentAnchorComponent)
      if (anchor.name.value === action.name) {
        const transform = getComponent(entity, TransformComponent)
        transform.position.copy(action.position)
        transform.rotation.copy(action.rotation)
      }
    }
  }

  for (const action of vpsAnchorLostQueue()) {
    for (const entity of anchors) {
      const anchor = getMutableComponent(entity, PersistentAnchorComponent)
      if (anchor.name.value === action.name) anchor.active.set(false)
    }
  }
}

export const VPSSystem = defineSystem({
  uuid: 'ee.engine.VPSSystem',
  insert: { after: XRPersistentAnchorSystem }
  // execute
})
