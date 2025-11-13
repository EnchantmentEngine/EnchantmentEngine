import { WorldNetworkAction } from '@ir-engine/ecs'
import { defineAction, matches } from '@ir-engine/hyperflux'
import { matchesVector3 } from '@ir-engine/spatial/src/common/functions/MatchesUtils'

export class AgentActions {
  static spawnAgent = defineAction(
    WorldNetworkAction.spawnEntity.extend({
      type: 'bots.SPAWN_AGENT',
      url: matches.string,
      $cache: true,
      position: matchesVector3
    })
  )
}
