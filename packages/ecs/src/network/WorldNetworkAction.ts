import { matchesEntityID, matchesEntitySourceID } from '@ir-engine/ecs'
import {
  defineAction,
  getState,
  matchesPeerID,
  matchesUserID,
  matchesWithDefault,
  NetworkTopics
} from '@ir-engine/hyperflux'
import { EngineState } from '../EngineState'
import { matchesEntityUUID } from '../Entity'

export class WorldNetworkAction {
  static spawnEntity = defineAction({
    type: 'ee.network.SPAWN_ENTITY',
    entityID: matchesEntityID,
    entitySourceID: matchesEntitySourceID,
    parentUUID: matchesEntityUUID,
    ownerID: matchesWithDefault(matchesUserID, () => getState(EngineState).userID),
    authorityPeerId: matchesPeerID.optional(),
    $cache: true,
    $topic: NetworkTopics.world
  })

  static destroyEntity = defineAction({
    type: 'ee.network.DESTROY_ENTITY',
    entityUUID: matchesEntityUUID,
    $cache: true,
    $topic: NetworkTopics.world
  })

  static requestAuthorityOverObject = defineAction({
    /** @todo embed $to restriction */
    type: 'ee.engine.world.REQUEST_AUTHORITY_OVER_ENTITY',
    entityUUID: matchesEntityUUID,
    newAuthority: matchesPeerID,
    $topic: NetworkTopics.world
  })

  static transferAuthorityOfObject = defineAction({
    type: 'ee.engine.world.TRANSFER_AUTHORITY_OF_ENTITY',
    ownerID: matchesUserID,
    entityUUID: matchesEntityUUID,
    newAuthority: matchesPeerID,
    $topic: NetworkTopics.world,
    $cache: true
  })
}
