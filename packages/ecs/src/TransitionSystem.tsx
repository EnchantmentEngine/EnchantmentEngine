import { TransitionComponent } from './ComponentFunctions'
import { defineQuery } from './QueryFunctions'
import { defineSystem } from './SystemFunctions'
import { AnimationSystemGroup } from './SystemGroups'

const transitionQuery = defineQuery([TransitionComponent])

export const TransitionSystem = defineSystem({
  uuid: 'TransitionSystem',
  execute: () => {
    const transitionEntities = transitionQuery()
    for (const entity of transitionEntities) {
      TransitionComponent.update(entity)
    }
  },
  insert: {
    before: AnimationSystemGroup
  }
})
