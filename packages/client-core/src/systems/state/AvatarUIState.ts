import { EngineState } from '@ir-engine/ecs'
import { NetworkTopics, Schema, defineAction, defineState, getMutableState, getState, none } from '@ir-engine/hyperflux'

export class AvatarUIActions {
  static setUserTyping = defineAction(
    Schema.Object(
      {
        userID: Schema.UserID({ required: true, default: () => getState(EngineState).userID }),
        typing: Schema.Bool({ required: true })
      },
      {
        $id: 'ee.client.avatar.USER_IS_TYPING',
        metadata: {
          $topic: NetworkTopics.world
        }
      }
    )
  )
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
