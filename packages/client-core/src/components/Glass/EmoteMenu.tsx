import { UUIDComponent } from '@ir-engine/ecs'
import { emoteAnimations, preloadedAnimations } from '@ir-engine/engine/src/avatar/animation/Util'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { dispatchAction } from '@ir-engine/hyperflux'
import React from 'react'

import {
  CustomEmoteCabbagePatch,
  CustomEmoteClapHands,
  CustomEmoteMacarena,
  CustomEmoteRunningMan,
  CustomEmoteTwistAndShout,
  CustomEmoteWaveHand
} from '@ir-engine/ui/src/icons'
import { MenuIconButton } from './buttons/MenuIconButton'

const icons = [
  {
    Icon: CustomEmoteWaveHand,
    stateName: 'wave',
    description: 'Wave hand'
  },

  {
    Icon: CustomEmoteClapHands,
    stateName: 'clap',
    description: 'Clap Hands'
  },

  {
    Icon: CustomEmoteRunningMan,
    stateName: 'dance4',
    description: 'Dances - Running Man'
  },

  {
    Icon: CustomEmoteCabbagePatch,
    stateName: 'dance1',
    description: 'Dances - Cabbage Patch'
  },

  {
    Icon: CustomEmoteTwistAndShout,
    stateName: 'dance3',
    description: 'Dances - Twist and Shout Dance'
  },

  {
    Icon: CustomEmoteMacarena,
    stateName: 'dance2',
    description: 'Dances - Macarena'
  }
]

export function EmoteMenu() {
  const playAnimation = (stateName: string) => {
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    dispatchAction(
      AvatarNetworkAction.setAnimationState({
        animationAsset: preloadedAnimations.emotes,
        clipName: stateName,
        loop: false,
        layer: 0,
        entityUUID: UUIDComponent.get(selfAvatarEntity)
      })
    )
  }

  return (
    <>
      {icons.map(({ Icon, stateName }, index) => {
        return (
          <MenuIconButton
            key={index}
            onClick={() => {
              playAnimation(emoteAnimations[stateName])
            }}
          >
            <Icon />
          </MenuIconButton>
        )
      })}
    </>
  )
}
