import { matchesEntityID, matchesEntitySourceID } from '@ir-engine/ecs'
import {
  ActionOptions,
  defineAction,
  dispatchAction,
  getState,
  matches,
  matchesPeerID,
  matchesUserID,
  matchesWithDefault,
  NetworkTopics,
  PeerID,
  UserID,
  Validator
} from '@ir-engine/hyperflux'
import { EngineState } from '../EngineState'
import { EntityID, EntityUUID, matchesEntityUUID, SourceID } from '../Entity'

export const matchesComponent = matches.object as Validator<unknown, Record<string, object>>

export class WorldNetworkAction {
  static spawnEntity = defineAction({
    type: 'ee.network.SPAWN_ENTITY',
    entityID: matchesEntityID,
    entitySourceID: matchesEntitySourceID,
    parentUUID: matchesEntityUUID,
    ownerID: matchesWithDefault(matchesUserID, () => getState(EngineState).userID),
    authorityPeerId: matchesPeerID.optional(),
    components: matchesComponent, // matches Record<JsonID, SerializedSchema> of component type
    $topic: NetworkTopics.world
  })

  static destroyEntity = defineAction({
    type: 'ee.network.DESTROY_ENTITY',
    entityUUID: matchesEntityUUID,
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
    $topic: NetworkTopics.world
  })
}

export type SpawnEntityProps<T extends Record<string, object>> = {
  components: T
  entityID: EntityID
  entitySourceID: SourceID
  parentUUID: EntityUUID
  ownerID?: UserID
  authorityPeerId?: PeerID
} & ActionOptions

export const spawnEntity = <T extends Record<string, object>>(props: SpawnEntityProps<T>) => {
  dispatchAction(WorldNetworkAction.spawnEntity(props))
}
