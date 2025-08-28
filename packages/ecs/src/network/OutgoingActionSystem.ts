import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { NetworkActionFunctions } from '@ir-engine/hyperflux'

const execute = () => {
  NetworkActionFunctions.sendOutgoingActions()
}

export const OutgoingActionSystem = defineSystem({
  uuid: 'ee.engine.OutgoingActionSystem',
  insert: { after: SimulationSystemGroup },
  execute
})
