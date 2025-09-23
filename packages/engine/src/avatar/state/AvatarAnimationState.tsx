import React, { useLayoutEffect } from 'react'

import { EntityUUID, useHasComponent, UUIDComponent } from '@ir-engine/ecs'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { defineState, getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { setAnimation } from '../animation/AvatarAnimationGraph'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'

/** @todo we need to support multiple mixed animations across the network */
export const AnimationNetworkState = defineState({
  name: 'ee.engine.avatar.AvatarAnimationState',

  initial: {} as Record<
    EntityUUID,
    {
      clipName: string | null
      animationName: string
      loop: boolean | null
      once: boolean | null
      layer: number | null
    }
  >,

  receptors: {
    /** @todo we need validation here ensuring that the authority peer is the same as the one that sent the animation state */
    onAnimationState: AvatarNetworkAction.setAnimationState.receive((action) => {
      getMutableState(AnimationNetworkState)[action.entityUUID].merge({
        clipName: action.clipName,
        animationName: action.animationAsset,
        loop: action.loop,
        once: action.once,
        layer: action.layer
      })
    })
  },

  reactor: () => {
    const avatarAnimationState = useMutableState(AnimationNetworkState)

    return (
      <>
        {avatarAnimationState.keys.map((entityUUID: EntityUUID) => (
          <AvatarReactor key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const AvatarReactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const { clipName, animationName, loop, once, layer } = useHookstate(
    getMutableState(AnimationNetworkState)[entityUUID]
  )
  const entity = UUIDComponent.useEntityByUUID(entityUUID)
  const hasAnimation = useHasComponent(entity, AvatarAnimationComponent)

  useLayoutEffect(() => {
    if (!entity || !hasAnimation || !clipName.value) return
    setAnimation(entity, {
      animationName: animationName.value,
      loop: !!loop.value,
      clipName: clipName.value,
      once: once.value,
      layer: layer.value
    })
  }, [entity, clipName, animationName, loop, once, layer, hasAnimation])

  return null
}
