import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { applyIncomingActions } from '@ir-engine/hyperflux'

const execute = () => {
  applyIncomingActions()
}

export const IncomingActionSystem = defineSystem({
  uuid: 'ee.engine.IncomingActionSystem',
  insert: { before: SimulationSystemGroup },
  execute
})
