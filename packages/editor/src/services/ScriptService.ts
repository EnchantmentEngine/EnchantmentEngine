import { createEntity, Entity, removeEntity, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { ScriptComponent } from '@ir-engine/engine'
import { defineState, getMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'

export const ScriptState = defineState({
  name: 'ee.engine.scene.ScriptSystemState',
  initial: () => {
    // filter out the js files from the file browser
    const scripts: Record<string, Entity> = {}
    return { scripts: scripts }
  }
})
// we use the keys to see the number of scripts and
export const ScriptService = {
  addScript: (scriptURL: any) => {
    const state = getMutableState(ScriptState)
    state.scripts.set({ ...state.scripts.value, [scriptURL]: UndefinedEntity })
  },
  removeScript: (scriptURL: any) => {
    const state = getMutableState(ScriptState)
    const { [scriptURL]: _, ...newScripts } = state.scripts.value
    state.scripts.set(newScripts)
  },
  activateScript: (scriptURL: any) => {
    const state = getMutableState(ScriptState)
    const scriptEntity = createEntity()
    setComponent(scriptEntity, NameComponent, 'Script-' + scriptURL)
    setComponent(scriptEntity, ScriptComponent, { src: scriptURL })
    state.scripts.set({ ...state.scripts.value, [scriptURL]: scriptEntity })
  },
  deactivateScript: (scriptURL: any) => {
    const state = getMutableState(ScriptState)
    const scriptEntity = state.scripts.value[scriptURL]
    if (scriptEntity !== UndefinedEntity) {
      removeEntity(scriptEntity)
      state.scripts.set({ ...state.scripts.value, [scriptURL]: UndefinedEntity })
    }
  }
}
