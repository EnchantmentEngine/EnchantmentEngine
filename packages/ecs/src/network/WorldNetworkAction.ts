import { defineAction, getState, NetworkTopics, Schema } from '@ir-engine/hyperflux'
import { EngineState } from '../EngineState'
import { EntitySchema } from '../Schemas'

export class WorldNetworkAction {
  static spawnEntity = defineAction({
    type: 'ee.network.SPAWN_ENTITY',
    schema: Schema.Object({
      entityID: EntitySchema.EntityID({ required: true }),
      entitySourceID: Schema.String({ required: true }), // no SourceID helper yet
      parentUUID: EntitySchema.EntityUUID({ required: true }),
      ownerID: Schema.UserID({ required: true, default: () => getState(EngineState).userID }),
      authorityPeerId: Schema.Optional(Schema.PeerID())
    }),
    meta: { $topic: NetworkTopics.world }
  })

  static destroyEntity = defineAction({
    type: 'ee.network.DESTROY_ENTITY',
    schema: Schema.Object({
      entityUUID: EntitySchema.EntityUUID({ required: true })
    }),
    meta: { $topic: NetworkTopics.world }
  })

  static requestAuthorityOverObject = defineAction({
    type: 'ee.engine.world.REQUEST_AUTHORITY_OVER_ENTITY',
    schema: Schema.Object({
      entityUUID: EntitySchema.EntityUUID({ required: true }),
      newAuthority: Schema.PeerID({ required: true })
    }),
    meta: { $topic: NetworkTopics.world }
  })

  static transferAuthorityOfObject = defineAction({
    type: 'ee.engine.world.TRANSFER_AUTHORITY_OF_ENTITY',
    schema: Schema.Object({
      ownerID: Schema.UserID({ required: true }),
      entityUUID: EntitySchema.EntityUUID({ required: true }),
      newAuthority: Schema.PeerID({ required: true })
    }),
    meta: { $topic: NetworkTopics.world }
  })
}
