import { NetworkObjectAuthorityTag } from '@ir-engine/ecs'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'

import { applyGamepadInput } from '.././functions/moveAvatar'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'

const controlledAvatarEntity = defineQuery([AvatarComponent, AvatarControllerComponent, NetworkObjectAuthorityTag])

const execute = () => {
  for (const entity of controlledAvatarEntity()) applyGamepadInput(entity)
}

export const AvatarMovementSystem = defineSystem({
  uuid: 'ee.engine.AvatarMovementSystem',
  insert: { with: SimulationSystemGroup },
  execute
})
