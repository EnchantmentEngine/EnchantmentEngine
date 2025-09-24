import { EntitySchema } from '@ir-engine/ecs'
import {
  ActionOptions,
  defineAction,
  dispatchAction,
  getState,
  NetworkTopics,
  PeerID,
  Schema,
  UserID
} from '@ir-engine/hyperflux'
import { EngineState } from '../EngineState'
import { EntityID, EntityUUID, SourceID } from '../Entity'

export class WorldNetworkAction {
  static spawnEntity = defineAction(
    Schema.Object(
      {
        entityID: EntitySchema.EntityID({ required: true }),
        entitySourceID: EntitySchema.SourceID({ required: true }),
        parentUUID: EntitySchema.EntityUUID({ required: true }),
        ownerID: Schema.UserID({ required: true, default: () => getState(EngineState).userID }),
        authorityPeerId: Schema.Optional(Schema.PeerID())
      },
      {
        $id: 'ee.network.SPAWN_ENTITY',
        metadata: {
          $topic: NetworkTopics.world
        }
      }
    )
  )

  static destroyEntity = defineAction(
    Schema.Object(
      {
        entityUUID: EntitySchema.EntityUUID({ required: true })
      },
      {
        $id: 'ee.network.DESTROY_ENTITY',
        metadata: {
          $topic: NetworkTopics.world
        }
      }
    )
  )

  static requestAuthorityOverObject = defineAction(
    Schema.Object(
      {
        entityUUID: EntitySchema.EntityUUID({ required: true }),
        newAuthority: Schema.PeerID({ required: true })
      },
      {
        $id: 'ee.network.REQUEST_AUTHORITY_OVER_ENTITY',
        metadata: {
          $topic: NetworkTopics.world
        }
      }
    )
  )

  static transferAuthorityOfObject = defineAction(
    Schema.Object(
      {
        ownerID: Schema.UserID({ required: true }),
        entityUUID: EntitySchema.EntityUUID({ required: true }),
        newAuthority: Schema.PeerID({ required: true })
      },
      {
        $id: 'ee.network.TRANSFER_AUTHORITY_OF_ENTITY',
        metadata: {
          $topic: NetworkTopics.world
        }
      }
    )
  )
}

export type SpawnEntityProps<T extends Record<string, object>> = {
  entityID: EntityID
  entitySourceID: SourceID
  parentUUID: EntityUUID
  ownerID?: UserID
  authorityPeerId?: PeerID
  components: T[keyof T][]
} & ActionOptions

export const spawnEntity = <T extends Record<string, object>>(props: SpawnEntityProps<T>) => {
  dispatchAction(WorldNetworkAction.spawnEntity(props))
}
