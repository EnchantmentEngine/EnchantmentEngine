import { defineState, getMutableState } from '@ir-engine/hyperflux'

import { createBaseRegistry } from '../functions/createRegistry'
import { GraphTemplate } from '../types/GraphTemplate'
import { IRegistry } from '../VisualScriptModule'

export const VisualScriptDomain = {
  ECS: 'ECS'
} as const

export type VisualScriptDomain = (typeof VisualScriptDomain)[keyof typeof VisualScriptDomain]

export const VisualScriptState = defineState({
  name: 'VisualScriptState',
  initial: () => {
    const registry = createBaseRegistry()
    return {
      templates: [] as GraphTemplate[],
      registries: {
        [VisualScriptDomain.ECS]: registry
      } as Record<VisualScriptDomain, IRegistry>
    }
  },

  registerProfile: (register: (registry: IRegistry) => IRegistry, domain: string) => {
    getMutableState(VisualScriptState).registries[domain].set((current) => register(current))
  }
})
