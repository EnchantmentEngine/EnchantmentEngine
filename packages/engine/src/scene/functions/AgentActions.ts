import { matchesEntityUUID, WorldNetworkAction } from '@ir-engine/ecs'
import { defineAction, matches, NetworkTopics } from '@ir-engine/hyperflux'
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

  static destroyAgent = defineAction(
    WorldNetworkAction.destroyEntity.extend({
      type: 'bots.DESTROY_AGENT',
      $cache: true
    })
  )

  static damageAgent = defineAction({
    type: 'bots.DAMAGE_AGENT',
    entityUUID: matchesEntityUUID,
    damage: matches.number,
    $topic: NetworkTopics.world
  })
}
