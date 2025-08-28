import * as bitECS from 'bitecs'
import React, { ErrorInfo, FC, memo, Suspense, useEffect, useLayoutEffect, useMemo } from 'react'
import * as bitECSLegacy from './bitecsLegacy'

import {
  defineState,
  getMutableState,
  HyperFlux,
  ImmutableArray,
  NO_PROXY,
  startReactor,
  State,
  useForceUpdate,
  useHookstate
} from '@ir-engine/hyperflux'

import { OpReturnType } from 'bitecs'
import {
  Component,
  EntityContext,
  LayerComponent,
  LayerComponents,
  LayerID,
  Layers,
  useOptionalComponent
} from './ComponentFunctions'
import { Entity } from './Entity'

export const $opType = Symbol.for('bitecs-opType')
export const $opTerms = Symbol.for('bitecs-opTerms')

export type { QueryTerm } from 'bitecs'

export const queries = [] as ReturnType<typeof defineQuery>[]

export function defineQuery(components: bitECS.QueryTerm[], layer: LayerID = Layers.Simulation) {
  const query = bitECSLegacy.defineQuery([...components, LayerComponents[layer]])
  const enterQuery = bitECSLegacy.enterQuery(query)
  const exitQuery = bitECSLegacy.exitQuery(query)

  const wrappedQuery = () => {
    return query(HyperFlux.store) as Entity[]
  }
  wrappedQuery.enter = () => {
    return enterQuery(HyperFlux.store) as Entity[]
  }
  wrappedQuery.exit = () => {
    return exitQuery(HyperFlux.store) as Entity[]
  }

  wrappedQuery._query = query
  wrappedQuery._enterQuery = enterQuery
  wrappedQuery._exitQuery = exitQuery

  queries.push(wrappedQuery)

  return wrappedQuery
}

export function removeQuery(queryOrTerms: ReturnType<typeof defineQuery> | bitECS.QueryTerm[]) {
  try {
    bitECS.removeQuery(HyperFlux.store, Array.isArray(queryOrTerms) ? queryOrTerms : queryOrTerms._query.components)
    if ('_enterQuery' in queryOrTerms) queryOrTerms._enterQuery.unsubscribe()
    if ('_exitQuery' in queryOrTerms) queryOrTerms._exitQuery.unsubscribe()
  } catch (e) {
    // console.log('Caught error', e, 'likely due to cleaning up a query that doesnt exist')
  }
}

export const query = (queryTerms: bitECS.QueryTerm[]) => bitECS.query(HyperFlux.store, queryTerms) as readonly Entity[]

const UseQuerySubreactorEntityCache = {} as Record<string, Set<State<Entity[]>>>
const UseQuerySubreactorCache = {} as Record<string, ReturnType<typeof startReactor>>

const sortAndJoinComponents = (components: bitECS.QueryTerm[]) =>
  components
    .map((c) => c.name)
    .sort()
    .join()

export function useQuery(components: bitECS.QueryTerm[], layer: LayerID = Layers.Simulation) {
  const entitiesState = useHookstate(() => {
    return [...query([...components, LayerComponents[layer]])] as Entity[]
  })

  useEffect(() => {
    const componentsWithLayer = [...components, LayerComponents[layer]]

    const key = sortAndJoinComponents(componentsWithLayer)

    const exists = !!UseQuerySubreactorEntityCache[key]
    if (!UseQuerySubreactorEntityCache[key]) UseQuerySubreactorEntityCache[key] = new Set()

    const cache = UseQuerySubreactorEntityCache[key]
    cache.add(entitiesState)
    if (!exists) {
      const subreactor = startReactor(() => {
        const update = useForceUpdate()

        const entities = query(componentsWithLayer) as Entity[]
        useEffect(() => {
          for (const state of cache) {
            state.set([...entities])
          }
        }, [JSON.stringify(entities)])

        useLayoutEffect(() => {
          const componentsWithLayer = [...components, LayerComponents[layer]]

          const unsubAdd = bitECS.observe(HyperFlux.store, bitECS.onAdd(...componentsWithLayer), update)
          const unsubRemove = bitECS.observe(HyperFlux.store, bitECS.onRemove(...componentsWithLayer), update)

          const unsubscribe = () => {
            unsubAdd()
            unsubRemove()
          }

          return () => {
            unsubscribe()
            removeQuery(componentsWithLayer)
          }
        }, [])

        return null
      }, 'useQuery ' + key)

      UseQuerySubreactorCache[key] = subreactor
    }

    return () => {
      cache.delete(entitiesState)
      if (cache.size === 0) {
        const subreactor = UseQuerySubreactorCache[key]
        subreactor.stop()
        delete UseQuerySubreactorEntityCache[key]
      }
    }
  }, [])

  const entities = entitiesState.get(NO_PROXY) as Entity[]

  return useMemo(() => [...entities], [JSON.stringify(entities)])
}

export type Query = ReturnType<typeof defineQuery>

export const SuspendedQueryChildState = defineState({
  name: 'ir.ecs.SuspendedQueryChildState',
  initial: [] as Array<{ entity: Entity; ChildEntityReactor: FC; props?: any }>
})

const Suspended = (props: any) => {
  useEffect(() => {
    const state = getMutableState(SuspendedQueryChildState)
    state.merge([props])
    return () => {
      state.set((v) => v.filter((v) => v !== props))
    }
  }, [])
  return null
}

export const EntityArrayBoundary = memo(
  (props: { entities: Entity[] | ImmutableArray<Entity>; ChildEntityReactor: FC; props?: any }) => {
    const MemoChildEntityReactor = useMemo(() => memo(props.ChildEntityReactor), [props.ChildEntityReactor])
    return (
      <>
        {props.entities.map((entity) => {
          const layer = LayerComponent.get(entity)
          const id = LayerComponents[layer].counterMap[entity]?.identifier
          return (
            <QueryReactorErrorBoundary key={id}>
              <Suspense fallback={<Suspended {...props} />}>
                <EntityContext.Provider value={entity}>
                  <MemoChildEntityReactor key={id} {...props.props} entity={entity} />
                </EntityContext.Provider>
              </Suspense>
            </QueryReactorErrorBoundary>
          )
        })}
      </>
    )
  }
)

const QuerySubReactor = memo(
  (props: { entity: Entity; ChildEntityReactor: FC; Components: bitECS.QueryTerm[]; props?: any }) => {
    const components = [] as Component[]
    for (const queryTerm of props.Components) {
      if (queryTerm.isComponent) {
        components.push(queryTerm)
      } else {
        const q = queryTerm[$opType] ? queryTerm : (queryTerm() as OpReturnType)
        const type = q[$opType]
        if (type === 'Or' || type === 'And') {
          components.push(...q[$opTerms])
        }
      }
    }

    const ids = [] as string[]
    for (const c of components) {
      useOptionalComponent(props.entity, c)
      const id = c.counterMap[props.entity]?.identifier
      if (id) ids.push(id)
    }
    const id = ids.join('_')

    return (
      <>
        <QueryReactorErrorBoundary>
          <Suspense fallback={<Suspended {...props} />}>
            <EntityContext.Provider value={props.entity}>
              <props.ChildEntityReactor key={id} {...props.props} entity={props.entity} />
            </EntityContext.Provider>
          </Suspense>
        </QueryReactorErrorBoundary>
      </>
    )
  }
)

export const QueryReactor = memo(
  (props: { Components: bitECS.QueryTerm[]; ChildEntityReactor: FC; props?: any; layer?: LayerID }) => {
    const entities = useQuery(props.Components, props.layer)
    const MemoChildEntityReactor = useMemo(() => memo(props.ChildEntityReactor), [props.ChildEntityReactor])
    return (
      <>
        {entities.map((entity) => {
          return (
            <QuerySubReactor
              key={entity}
              entity={entity}
              Components={props.Components}
              ChildEntityReactor={MemoChildEntityReactor}
              props={props.props}
            />
          )
        })}
      </>
    )
  }
)

interface ErrorState {
  error: Error | null
}

class QueryReactorErrorBoundary extends React.Component<any, ErrorState> {
  public state: ErrorState = {
    error: null
  }

  public static getDerivedStateFromError(error: Error): ErrorState {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    return this.state.error ? null : this.props.children
  }
}
