import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@ir-engine/ecs/src/SystemGroups'

import { useEffect } from 'react'

const reactor = () => {
  useEffect(() => {
    /** @todo currently this creates an instance of each component, which can lead to a lot of unnecessary extra memory */
    // VisualScriptState.registerProfile(registerEngineProfile, VisualScriptDomain.ECS)
  }, [])
  return null
}

export const VisualScriptSystem = defineSystem({
  uuid: 'ee.engine.VisualScriptSystem',
  insert: { with: InputSystemGroup },
  reactor
})
