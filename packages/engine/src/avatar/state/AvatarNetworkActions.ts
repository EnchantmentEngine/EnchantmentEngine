import matches from 'ts-matches'

import { matchesEntityUUID } from '@ir-engine/ecs'
import { defineAction, NetworkTopics } from '@ir-engine/hyperflux'
import { SpawnObjectActions } from '@ir-engine/spatial/src/transform/SpawnObjectActions'

import { matchesIkTarget } from '../animation/Util'

export class AvatarNetworkAction {
  static spawn = defineAction(
    SpawnObjectActions.spawnObject.extend({
      type: 'ee.engine.avatar.SPAWN',
      avatarURL: matches.string,
      name: matches.string
    })
  )

  static setAnimationState = defineAction({
    type: 'ee.engine.avatar.SET_ANIMATION_STATE',
    entityUUID: matchesEntityUUID,
    clipName: matches.string.optional(),
    animationAsset: matches.string,
    loop: matches.boolean.optional(),
    needsSkip: matches.boolean.optional(),
    layer: matches.number.optional(),
    $topic: NetworkTopics.world
  })

  static setAvatarURL = defineAction({
    type: 'ee.engine.avatar.SET_AVATAR_URL',
    entityUUID: matchesEntityUUID,
    avatarURL: matches.string,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static setName = defineAction({
    type: 'ee.engine.avatar.SET_AVATAR_NAME',
    entityUUID: matchesEntityUUID,
    name: matches.string,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static spawnIKTarget = defineAction(
    SpawnObjectActions.spawnObject.extend({
      type: 'ee.engine.avatar.SPAWN_IK_TARGET',
      name: matchesIkTarget,
      blendWeight: matches.number
    })
  )
}
