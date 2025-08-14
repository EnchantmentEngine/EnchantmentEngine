import { defineAction, getState, NetworkTopics } from '@ir-engine/hyperflux'
import { EngineState } from '../EngineState'
import { S } from '../schemas/JSONSchemas'

export class WorldNetworkAction {
  static spawnEntity = defineAction({
    type: 'ee.network.SPAWN_ENTITY',
    schema: S.Object({
      entityID: S.EntityID({ required: true }),
      entitySourceID: S.String({ required: true }), // no SourceID helper yet
      parentUUID: S.EntityUUID({ required: true }),
      ownerID: S.UserID({ required: true }),
      authorityPeerId: S.Optional(S.PeerID())
    }),
    defaults: () => ({ ownerID: getState(EngineState).userID }),
    meta: { $cache: true, $topic: NetworkTopics.world }
  })

  static destroyEntity = defineAction({
    type: 'ee.network.DESTROY_ENTITY',
    schema: S.Object({
      entityUUID: S.EntityUUID({ required: true })
    }),
    meta: { $cache: true, $topic: NetworkTopics.world }
  })

  static requestAuthorityOverObject = defineAction({
    type: 'ee.engine.world.REQUEST_AUTHORITY_OVER_ENTITY',
    schema: S.Object({
      entityUUID: S.EntityUUID({ required: true }),
      newAuthority: S.PeerID({ required: true })
    }),
    meta: { $topic: NetworkTopics.world }
  })

  static transferAuthorityOfObject = defineAction({
    type: 'ee.engine.world.TRANSFER_AUTHORITY_OF_ENTITY',
    schema: S.Object({
      ownerID: S.UserID({ required: true }),
      entityUUID: S.EntityUUID({ required: true }),
      newAuthority: S.PeerID({ required: true })
    }),
    meta: { $topic: NetworkTopics.world, $cache: true }
  })
}
