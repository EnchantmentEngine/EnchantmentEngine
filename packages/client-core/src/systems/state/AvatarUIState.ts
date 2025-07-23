import { Engine } from '@ir-engine/ecs'
import {
  NetworkTopics,
  defineAction,
  defineState,
  getMutableState,
  matches,
  matchesUserID,
  matchesWithDefault,
  none
} from '@ir-engine/hyperflux'

export class AvatarUIActions {
  static setUserTyping = defineAction({
    type: 'ee.client.avatar.USER_IS_TYPING',
    userID: matchesWithDefault(matchesUserID, () => Engine.instance.userID),
    typing: matches.boolean,
    $topic: NetworkTopics.world
  })
}

export const AvatarUIState = defineState({
  name: 'AvatarUIState',

  initial: {
    usersTyping: {} as { [key: string]: true }
  },

  receptors: {
    onSetUserType: AvatarUIActions.setUserTyping.receive((action) => {
      const state = getMutableState(AvatarUIState)
      state.usersTyping[action.userID].set(action.typing ? true : none)
    })
  }
})
