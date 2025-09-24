import { defineAction, NetworkTopics } from '@ir-engine/hyperflux'

import { Schema } from '@ir-engine/hyperflux'

import { EntitySchema } from '@ir-engine/ecs'

export class AvatarNetworkAction {
  static setAnimationState = defineAction(
    Schema.Object(
      {
        entityUUID: EntitySchema.EntityUUID(),
        clipName: Schema.String({ required: false }),
        animationAsset: Schema.String({ required: true }),
        loop: Schema.Bool({ required: false, default: true }),
        once: Schema.Bool({ required: false, default: false }),
        layer: Schema.Number({ required: false, default: 0 })
      },
      {
        $id: 'ee.engine.avatar.SET_ANIMATION_STATE',
        metadata: { $topic: NetworkTopics.world }
      }
    )
  )
}
