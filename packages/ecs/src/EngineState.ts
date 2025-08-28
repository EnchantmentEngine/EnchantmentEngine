import { defineState, UserID } from '@ir-engine/hyperflux'

export const EngineState = defineState({
  name: 'EngineState',
  initial: () => ({
    /**
     * The uuid of the logged-in user
     */
    userID: '' as UserID,

    /** non-reactive, never updates, use isEditing for that */
    isEditor: false,
    isEditing: false
  })
})
