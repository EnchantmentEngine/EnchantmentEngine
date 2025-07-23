import { defineState } from '@ir-engine/hyperflux'

export const EditorWarningState = defineState({
  name: 'EditorWarningState',
  initial: { warning: null as string | null }
})
