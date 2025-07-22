import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'
import { SceneOptionData } from '@ir-engine/ui/src/components/editor/AddScene/AddScene'
import { SceneItemMoreOtionData } from '../panels/scenes/SceneItem'
export type StudioUIAddons = {
  cancelText?: string
  container: Record<string, JSX.Element>
  newScene: Record<string, SceneOptionData>
  sceneItemMoreOptions: Record<string, SceneItemMoreOtionData>
  //more addon points to come here
}
export const UIAddonsState = defineState({
  name: 'UIAddonsState',
  initial: () => ({
    projectName: null as string | null,
    editor: {
      container: {},
      newScene: {},
      sceneItemMoreOptions: {}
    } as StudioUIAddons,
    dashboard: {
      newScene: {}
    } as StudioUIAddons
  }),
  extension: syncStateWithLocalStorage(['projectName'])
})
