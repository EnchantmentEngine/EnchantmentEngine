import { defineComponent, EngineState, Entity, S, useComponent } from '@ir-engine/ecs'
import { getState, isClient } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { addError, clearErrors, removeError } from '../scene/functions/ErrorFunctions'

export function validateScriptUrl(entity: Entity, url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      addError(entity, ScriptComponent, 'INVALID_URL_SCHEME', 'Invalid URL scheme')
      return false
    }
    if (!parsedUrl.pathname.endsWith('.js')) {
      addError(entity, ScriptComponent, 'INVALID_SCRIPT_TYPE', 'URL does not point to a valid script file (.js)')
      return false
    }
    return true
  } catch (e) {
    addError(entity, ScriptComponent, 'INVALID_URL_FORMAT', 'Invalid URL format')
    return false
  }
}

export const ScriptComponent = defineComponent({
  name: 'ScriptComponent',
  jsonID: 'IR_script',

  schema: S.Object({
    src: S.String(),
    bundledSrc: S.String()
  }),

  reactor: ({ entity }) => {
    // Must never run scripts in editor or server
    if (getState(EngineState).isEditor || !isClient) return

    const scriptComponent = useComponent(entity, ScriptComponent)

    useEffect(() => {
      const script = document.createElement('script')

      if (!scriptComponent.bundledSrc.value) return // return for empty src

      if (!validateScriptUrl(entity, scriptComponent.bundledSrc.value)) return // validation step

      clearErrors(entity, ScriptComponent)

      script.src = scriptComponent.bundledSrc.value
      script.type = 'module'

      script.onerror = () => {
        addError(entity, ScriptComponent, 'MISSING_FILE', 'Failed to load the script!')
      }

      script.onload = (e) => {
        removeError(entity, ScriptComponent, 'MISSING_FILE')
      }

      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    }, [])
  },
  errors: ['MISSING_FILE', 'INVALID_URL_SCHEME', 'INVALID_SCRIPT_TYPE', 'INVALID_URL_FORMAT']
})
