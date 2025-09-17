import { defineAction, NetworkTopics, Schema } from '@ir-engine/hyperflux'
import { SpawnObjectActions } from '@ir-engine/spatial/src/transform/SpawnObjectActions'

import { EntitySchema } from '@ir-engine/ecs'
import { ikTargets } from '../animation/Util'

export class AvatarNetworkAction {
  static spawn = defineAction(
    SpawnObjectActions.spawnObject.extend(
      Schema.Object(
        {
          avatarURL: Schema.String({ required: true }),
          name: Schema.String({ required: true })
        },
        {
          $id: 'ee.engine.avatar.SPAWN'
        }
      )
    )
  )

  static setAnimationState = defineAction(
    Schema.Object(
      {
        entityUUID: EntitySchema.EntityUUID(),
        clipName: Schema.String({ required: false }),
        animationAsset: Schema.String({ required: true }),
        loop: Schema.Bool({ required: false, default: true }),
        needsSkip: Schema.Bool({ required: false, default: false }),
        layer: Schema.Number({ required: false, default: 0 })
      },
      {
        $id: 'ee.engine.avatar.SET_ANIMATION_STATE',
        metadata: { $topic: NetworkTopics.world }
      }
    )
  )

  static setAvatarURL = defineAction(
    Schema.Object(
      {
        entityUUID: EntitySchema.EntityUUID(),
        avatarURL: Schema.String({ required: true })
      },
      {
        $id: 'ee.engine.avatar.SET_AVATAR_URL',
        metadata: { $topic: NetworkTopics.world }
      }
    )
  )

  static setName = defineAction(
    Schema.Object(
      {
        entityUUID: EntitySchema.EntityUUID(),
        name: Schema.String({ required: true })
      },
      {
        $id: 'ee.engine.avatar.SET_AVATAR_NAME',
        metadata: { $topic: NetworkTopics.world }
      }
    )
  )

  static spawnIKTarget = defineAction(
    SpawnObjectActions.spawnObject.extend(
      Schema.Object(
        {
          name: Schema.LiteralUnion([...(Object.keys(ikTargets) as Array<keyof typeof ikTargets>)]),
          blendWeight: Schema.Number({ required: false, default: 1.0 })
        },
        {
          $id: 'ee.engine.avatar.SPAWN_IK_TARGET',
          metadata: { $topic: NetworkTopics.world }
        }
      )
    )
  )
}
