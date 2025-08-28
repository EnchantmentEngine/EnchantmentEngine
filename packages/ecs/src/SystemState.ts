import { defineState, ReactorRoot, State } from '@ir-engine/hyperflux'

import { Entity } from './Entity'
import { defineQuery, QueryTerm } from './QueryFunctions'
import { SystemUUID } from './SystemFunctions'

export const SystemState = defineState({
  name: 'ee.meta.SystemState',
  initial: () => ({
    performanceProfilingEnabled: false,
    activeSystemReactors: new Map<SystemUUID, ReactorRoot>(),
    currentSystemUUID: '__null__' as SystemUUID,
    reactiveQueryStates: new Set<{
      query: ReturnType<typeof defineQuery>
      entities: State<Entity[]>
      components: QueryTerm[]
    }>()
  })
})
