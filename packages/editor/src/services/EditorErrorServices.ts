import { defineState } from '@ir-engine/hyperflux'

export const EditorErrorState = defineState({
  name: 'EditorErrorState',
  initial: { error: null as string | null }
})
