import { v4 as uuidv4 } from 'uuid'

import { createHookableFunction } from './createHookableFunction'

import { OpaqueType } from '../types/OpaqueType'
import { NetworkID, PeerID, UserID } from '../types/Types'
import { isDev } from './EnvironmentConstants'
import { ReactorReconciler, ReactorRoot } from './ReactorFunctions'
import { setInitialState, StateDefinitions } from './StateFunctions'
import { HyperFlux } from './StoreFunctions'

/**
 * Actions now use the compiled ECS Schema system (see ecs JSONSchemas / JSONSchemaTypes).
 */
import type { Schema, Static } from '../../../ecs/src/schemas/JSONSchemaTypes'
import { Kind } from '../../../ecs/src/schemas/JSONSchemaTypes'

export type Topic = OpaqueType<'Topic'> & string

export type ActionRecipients = PeerID | PeerID[] | 'all' | null | undefined

export type ActionCacheOptions =
  | boolean
  | {
      removePrevious?: boolean | string[]
      disable?: boolean
    }

export type ActionOptions = {
  $uuid?: string
  $peer?: PeerID
  $user?: UserID
  $to?: ActionRecipients
  $time?: number | undefined
  $topic?: Topic
  $network?: NetworkID | undefined
  $cache?: ActionCacheOptions
  $fromCache?: true
  $stack?: string[]
  $ERROR?: { message: string; stack: string[] }
}

/** Generic action (flat payload + meta) */
export type AnyAction = { type: string | string[] } & ActionOptions & Record<string, any>

export type ResolvedActionType<Shape = any> = AnyAction

/** Utility: deep equality (used in caching logic) */
export function deepEqual(x: any, y: any): boolean {
  if (x === y) return true
  if (typeof x == 'object' && x != null && typeof y == 'object' && y != null) {
    if (Object.keys(x).length != Object.keys(y).length) return false
    for (const prop in x) {
      if (typeof y[prop] !== 'undefined') {
        if (!deepEqual(x[prop], y[prop])) return false
      } else return false
    }
    return true
  }
  return false
}

// -------------------------------------------------------------
// Compiled Schema Helpers (defaults + validation)
// -------------------------------------------------------------
const baseDefaults: Record<string, any> = {
  Number: 0,
  Bool: false,
  String: '',
  Array: () => [],
  Tuple: () => [],
  Record: () => ({}),
  Object: () => ({}),
  Union: undefined,
  Literal: undefined,
  Null: null,
  Undefined: undefined,
  Any: undefined
}

const clone = <T>(v: T): T =>
  Array.isArray(v) ? (v.slice() as any) : v && typeof v === 'object' ? { ...(v as any) } : v

const applyDefaultsFromCompiledSchema = (schema: Schema, target: any): any => {
  const kind = (schema as any)[Kind] as string
  const opt = (schema as any).options || {}
  let value = target
  if (value === undefined) {
    if (opt.default !== undefined) {
      try {
        value = typeof opt.default === 'function' && opt.default.length === 0 ? (opt.default as any)() : opt.default
      } catch {
        value = opt.default
      }
    } else if (baseDefaults[kind]) {
      const base = baseDefaults[kind]
      value = typeof base === 'function' ? base() : clone(base)
    }
  }
  switch (kind) {
    case 'Object': {
      const props = (schema as any).properties || {}
      if (typeof value !== 'object' || value === null || Array.isArray(value)) value = {}
      for (const [k, propSchema] of Object.entries<any>(props)) {
        value[k] = applyDefaultsFromCompiledSchema(propSchema, value[k])
      }
      break
    }
    case 'Array': {
      if (!Array.isArray(value)) value = []
      break
    }
    case 'Tuple': {
      if (!Array.isArray(value)) value = []
      const items: Schema[] = (schema as any).properties || []
      for (let i = 0; i < items.length; i++) value[i] = applyDefaultsFromCompiledSchema(items[i], value[i])
      break
    }
    case 'Record': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) value = {}
      break
    }
    case 'Union': {
      // select first schema default if union has schemas
      const variants: Schema[] = (schema as any).properties || []
      if (value === undefined && variants.length) value = applyDefaultsFromCompiledSchema(variants[0], undefined)
      break
    }
    default:
      break
  }
  return value
}

const validateCompiledSchemaValue = (schema: Schema, value: any, path: string, errors: string[]): void => {
  const kind = (schema as any)[Kind] as string
  const current = path || '(root)'
  const opt = (schema as any).options || {}
  if (opt.validate) {
    try {
      if (!(opt.validate as any)(value, undefined, undefined)) errors.push(`Custom validate failed at ${current}`)
    } catch (e) {
      errors.push(`Custom validator threw at ${current}: ${(e as Error).message}`)
    }
  }
  switch (kind) {
    case 'Number':
      if (typeof value !== 'number') errors.push(`Expected number at ${current}`)
      break
    case 'Bool':
      if (typeof value !== 'boolean') errors.push(`Expected boolean at ${current}`)
      break
    case 'String':
      if (typeof value !== 'string') errors.push(`Expected string at ${current}`)
      break
    case 'Literal': {
      const lit = (schema as any).properties
      if (value !== lit) errors.push(`Expected literal ${lit} at ${current}`)
      break
    }
    case 'Object': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push(`Expected object at ${current}`)
        return
      }
      const props = (schema as any).properties || {}
      for (const [k, propSchema] of Object.entries<any>(props))
        validateCompiledSchemaValue(propSchema, (value as any)[k], current === '(root)' ? k : current + '.' + k, errors)
      break
    }
    case 'Array':
    case 'Tuple': {
      if (!Array.isArray(value)) {
        errors.push(`Expected array/tuple at ${current}`)
        return
      }
      break
    }
    case 'Union': {
      const variants: Schema[] = (schema as any).properties || []
      if (
        variants.length &&
        !variants.some((v) => {
          const errs: string[] = []
          validateCompiledSchemaValue(v, value, current, errs)
          return !errs.length
        })
      )
        errors.push(`Value at ${current} failed union variants`)
      break
    }
    default:
      break
  }
}

// -------------------------------------------------------------
// Action Definition API (compiled schemas)
// -------------------------------------------------------------
export type ActionCreator<P extends Record<string, any>, TType extends string> = {
  (partial?: Partial<P> & ActionOptions): AnyAction & P & { type: TType | string[] }
  type: TType
  schema: Schema
  defaults: () => Partial<P>
  validate: (payload: unknown) => payload is P
  extend: <CT extends string, CS extends Schema, CP extends Record<string, any>>(def: {
    type: CT
    schema: CS
    defaults?: Partial<CP> | (() => Partial<CP>)
  }) => ActionCreator<CP, CT>
  receive: (fn: (action: AnyAction & P & { type: TType | string[] }) => void) => ActionReceptor<P, TType>
  matches: (a: AnyAction) => a is AnyAction & P & { type: TType | string[] }
  matchesAction: { test: (a: AnyAction) => boolean }
}

export type ActionReceptor<P extends Record<string, any>, TType extends string> = ((
  action: AnyAction & P & { type: TType | string[] }
) => void) & {
  matchesAction: { test: (a: AnyAction) => boolean }
  validate: (filter: (action: AnyAction & P & { type: TType | string[] }) => boolean) => ActionReceptor<P, TType>
  validator?: (action: AnyAction & P & { type: TType | string[] }) => boolean
}

export function isActionReceptor(f: any): f is ActionReceptor<any, any> {
  return !!f && typeof f === 'function' && !!f.matchesAction
}

export const ActionDefinitions: Record<string, ActionCreator<any, string>> = {}

export function defineAction<TType extends string, S extends Schema & { [Kind]: 'Object' }>(def: {
  type: TType | [TType, ...string[]]
  schema: S
  defaults?: Partial<Static<S>> | (() => Partial<Static<S>>)
  meta?: Partial<ActionOptions>
}): ActionCreator<Static<S> & Record<string, any>, TType> {
  type P = Static<S> & Record<string, any>
  const typeChain = Array.isArray(def.type) ? def.type : [def.type]
  const primaryType = typeChain[0] as TType
  const getDefaults = (): Partial<P> =>
    (typeof def.defaults === 'function' ? (def.defaults as any)() : def.defaults) || {}

  const validate = (payload: unknown): payload is P => {
    const errors: string[] = []
    validateCompiledSchemaValue(def.schema, payload, '', errors)
    return !errors.length
  }

  const creator = ((partial?: Partial<P> & ActionOptions) => {
    const payload: any = applyDefaultsFromCompiledSchema(def.schema, {})
    Object.assign(payload, getDefaults())
    if (partial) for (const [k, v] of Object.entries(partial)) if (!k.startsWith('$')) payload[k] = v

    const errors: string[] = []
    validateCompiledSchemaValue(def.schema, payload, '', errors)
    if (errors.length)
      throw new Error(`Schema validation failed for action ${primaryType} (compiled):\n${errors.join('\n')}`)

    const action: AnyAction = {
      ...payload,
      type: typeChain.length === 1 ? primaryType : typeChain
    }

    if (partial) for (const [k, v] of Object.entries(partial)) if (k.startsWith('$')) (action as any)[k] = v
    if (def.meta) Object.assign(action, def.meta)

    return action as AnyAction & P & { type: TType | string[] }
  }) as ActionCreator<P, TType>

  creator.type = primaryType
  creator.schema = def.schema
  creator.defaults = () => getDefaults()
  creator.validate = validate
  creator.extend = (ext) =>
    defineAction({
      type: [ext.type, ...typeChain],
      schema: ext.schema as any,
      defaults: ext.defaults as any
    }) as any
  creator.matches = (a: AnyAction): a is AnyAction & P & { type: TType | string[] } => {
    if (!a || !a.type) return false
    const types = Array.isArray(a.type) ? a.type : [a.type]
    if (!types.includes(primaryType)) return false
    const subset: any = {}
    if ((def.schema as any)[Kind] === 'Object') {
      for (const key of Object.keys((def.schema as any).properties || {})) subset[key] = (a as any)[key]
    }
    return validate(subset)
  }
  creator.matchesAction = { test: (a: AnyAction) => creator.matches(a) }
  creator.receive = (receptor) => {
    const hookable = createHookableFunction(receptor) as any
    hookable.matchesAction = { test: (a: AnyAction) => creator.matches(a) }
    hookable.validate = (fn: any) => {
      hookable.validator = fn
      return hookable
    }
    return hookable as ActionReceptor<P, TType>
  }

  ActionDefinitions[primaryType] = creator as any
  return creator
}

// -------------------------------------------------------------
// Dispatch & Processing Pipeline (unchanged semantics)
// -------------------------------------------------------------
export const dispatchAction = <A extends AnyAction>(_action: A) => {
  const action = JSON.parse(JSON.stringify(_action)) as AnyAction

  const peerID = HyperFlux.store.peerID
  const agentID = HyperFlux.store.getAgentID()

  action.$peer = action.$peer ?? peerID
  action.$user = action.$user ?? agentID
  action.$to = action.$to ?? 'all'
  action.$time = action.$time ?? HyperFlux.store.getDispatchTime() + HyperFlux.store.defaultDispatchDelay()
  action.$cache = action.$cache ?? false
  action.$uuid = action.$uuid ?? uuidv4()
  action.$topic = action.$topic ?? HyperFlux.store.defaultTopic
  const topic = action.$topic

  if (isDev && !action.$stack) {
    const trace = { stack: '' as string }
    Error.captureStackTrace?.(trace, dispatchAction)
    const stack = (trace.stack || '').split('\n')
    stack.shift()
    action.$stack = stack
  }

  const internal = action as Required<Pick<ActionOptions, '$uuid' | '$time' | '$topic' | '$to' | '$peer' | '$user'>> &
    AnyAction

  HyperFlux.store.actions.incoming.push(internal as any)
  addOutgoingTopicIfNecessary(topic as Topic)
  return Object.freeze(action) as A
}

export function addOutgoingTopicIfNecessary(topic: Topic) {
  if (!HyperFlux.store.actions.outgoing[topic]) {
    HyperFlux.store.actions.outgoing[topic] = {
      queue: [],
      history: [],
      forwardedUUIDs: new Set()
    }
  }
}

const _updateCachedActions = (incomingAction: AnyAction) => {
  if (incomingAction.$cache) {
    const cachedActions = HyperFlux.store.actions.cached as AnyAction[]
    if (typeof incomingAction.$cache === 'boolean') {
      if (incomingAction.$cache) cachedActions.push(incomingAction)
    } else {
      const remove = incomingAction.$cache.removePrevious
      if (remove) {
        for (const a of [...cachedActions]) {
          if (a.$peer === incomingAction.$peer && a.type === incomingAction.type) {
            if (remove === true) {
              const idx = cachedActions.indexOf(a)
              cachedActions.splice(idx, 1)
            } else {
              let match = true
              for (const key of remove) {
                if (!deepEqual((a as any)[key], (incomingAction as any)[key])) {
                  match = false
                  break
                }
              }
              if (match) {
                const idx = cachedActions.indexOf(a)
                cachedActions.splice(idx, 1)
              }
            }
          }
        }
      }
      if (!incomingAction.$cache.disable) cachedActions.push(incomingAction)
    }
  }
}

const applyIncomingActionsToAllQueues = (action: AnyAction) => {
  for (const [queueHandle, queue] of HyperFlux.store.actions.queues) {
    if ((queueHandle as any).test(action)) {
      if (queue.actions.length > 0) {
        const last = queue.actions.at(-1) as AnyAction
        if (last && last.$time !== undefined && action.$time !== undefined && last.$time > action.$time)
          queue.needsResync = true
      }
      queue.actions.push(action as AnyAction)
    }
  }
}

const createEventSourceQueues = (action: AnyAction) => {
  for (const definition of StateDefinitions.values()) {
    if (!definition.receptors || HyperFlux.store.receptors[definition.name]) continue

    const matchedActions = Object.values(definition.receptors).map((r: any) => r.matchesAction)
    if (!matchedActions.some((m: any) => m.test(action))) continue

    const receptorActionQueue = defineActionQueue(matchedActions)
    definition.receptorActionQueue = receptorActionQueue
    receptorActionQueue.needsResync = true

    if (!HyperFlux.store.stateMap[definition.name]) setInitialState(definition)

    const applyEventSourcing = () => {
      if (receptorActionQueue.needsResync) {
        setInitialState(definition)
        receptorActionQueue.resync()
      }
      let hasNewActions = false
      for (const act of receptorActionQueue()) {
        for (const defReceptor of Object.values(definition.receptors!)) {
          try {
            const receptor = defReceptor as any
            if (receptor.matchesAction.test(act)) {
              if (receptor.validator && !receptor.validator(act)) continue
              receptor(act)
              hasNewActions = true
            }
          } catch (e) {
            HyperFlux.store.logger('hyperflux:action').error(e)
          }
        }
      }
      if (hasNewActions && HyperFlux.store.stateReactors[definition.name]) {
        ReactorReconciler.flushSync(() => HyperFlux.store.stateReactors[definition.name].run())
      }
    }

    HyperFlux.store.receptors[definition.name] = applyEventSourcing
  }
}

const _applyIncomingAction = (action: AnyAction) => {
  if (action.$uuid && HyperFlux.store.actions.knownUUIDs.has(action.$uuid)) {
    try {
      JSON.stringify(action)
    } catch {
      console.log('error in logging repeat action', action)
    }
    const idx = HyperFlux.store.actions.incoming.indexOf(action as any)
    if (idx !== -1) HyperFlux.store.actions.incoming.splice(idx, 1)
    return
  }
  _updateCachedActions(action)
  createEventSourceQueues(action)
  applyIncomingActionsToAllQueues(action)
  const messageStackError = (e: any) => {
    const message = (e as Error).message
    const stack = (e as Error).stack?.split('\n') || []
    stack.shift()
    action.$ERROR = { message, stack }
    HyperFlux.store.logger('hyperflux:action').error(e)
  }
  try {
    /* receptor execution handled separately */
  } catch (e) {
    messageStackError(e)
  } finally {
    HyperFlux.store.actions.history.push(action as AnyAction)
    if (action.$uuid) HyperFlux.store.actions.knownUUIDs.add(action.$uuid)
    const idx = HyperFlux.store.actions.incoming.indexOf(action as any)
    if (idx !== -1) HyperFlux.store.actions.incoming.splice(idx, 1)
  }
}

const _forwardIfNecessary = (action: AnyAction) => {
  if (!action.$topic) return
  addOutgoingTopicIfNecessary(action.$topic as Topic)
  if (HyperFlux.store.peerID === action.$peer || HyperFlux.store.forwardingTopics.has(action.$topic as Topic)) {
    const outgoingActions = HyperFlux.store.actions.outgoing[action.$topic as Topic]
    if (!outgoingActions) return
    if (action.$uuid && outgoingActions.forwardedUUIDs.has(action.$uuid)) return
    ;(outgoingActions.queue as AnyAction[]).push(action)
    if (action.$uuid) outgoingActions.forwardedUUIDs.add(action.$uuid)
  }
}

const applyEventSourcingToAllQueues = () => {
  for (const receptors of Object.values(HyperFlux.store.receptors)) receptors()
}

export const applyIncomingActions = () => {
  const incoming = HyperFlux.store.actions.incoming as AnyAction[]
  if (!incoming.length) return
  const now = HyperFlux.store.getDispatchTime()
  const actions = incoming.slice()
  for (const action of actions) {
    _forwardIfNecessary(action)
    if (action.$time === undefined || action.$time <= now) _applyIncomingAction(action)
  }
  applyEventSourcingToAllQueues()
}

export const clearOutgoingActions = (topic: Topic) => {
  if (!HyperFlux.store.actions.outgoing[topic]) return
  const { queue, history, forwardedUUIDs } = HyperFlux.store.actions.outgoing[topic]
  for (const action of queue) {
    history.push(action)
    forwardedUUIDs.add(action.$uuid)
  }
  queue.length = 0
}

// -------------------------------------------------------------
// Action Queues
// -------------------------------------------------------------
export type ActionMatcher = { test: (a: AnyAction) => boolean }

export function defineActionQueue(matchers: ActionMatcher[] | ActionMatcher) {
  const shapes = Array.isArray(matchers) ? matchers : [matchers]
  const shapeHash = shapes.map((_, i) => `m${i}`).join('|')

  const getOrCreateInstance = () => {
    const queueMap = HyperFlux.store.actions.queues
    const reactorRoot = HyperFlux.store.getCurrentReactorRoot()
    let queueInstance = queueMap.get(actionQueueGetter)!
    if (!queueInstance) {
      queueInstance = {
        actions: [],
        nextIndex: 0,
        needsResync: false,
        reactorRoot
      }
      queueMap.set(actionQueueGetter, queueInstance)
      reactorRoot?.cleanupFunctions.add(() => removeActionQueue(actionQueueGetter))
    }
    return queueInstance
  }

  const actionQueueGetter = () => {
    const queueInstance = getOrCreateInstance()
    const result = queueInstance.actions.slice(queueInstance.nextIndex) as AnyAction[]
    queueInstance.nextIndex = queueInstance.actions.length
    return result
  }

  ;(actionQueueGetter as any).test = (a: AnyAction) => shapes.some((s) => s.test(a))
  ;(actionQueueGetter as any).shapeHash = shapeHash

  Object.defineProperty(actionQueueGetter, 'instance', {
    get: () => getOrCreateInstance()
  })
  Object.defineProperty(actionQueueGetter, 'needsResync', {
    get: () => getOrCreateInstance().needsResync,
    set: (val) => {
      getOrCreateInstance().needsResync = val
    }
  })
  ;(actionQueueGetter as any).resync = () => {
    const queue = getOrCreateInstance()
    queue.actions = HyperFlux.store.actions.history
      .filter((a: AnyAction) => (actionQueueGetter as any).test(a))
      .sort((a: AnyAction, b: AnyAction) => (a.$time || 0) - (b.$time || 0))
    queue.nextIndex = 0
    ;(actionQueueGetter as any).needsResync = false
  }

  return actionQueueGetter as any
}

export const createActionQueue = defineActionQueue

export type ActionQueueHandle = ReturnType<typeof defineActionQueue>
export type ActionQueueInstance = {
  actions: AnyAction[]
  nextIndex: number
  needsResync: boolean
  reactorRoot: ReactorRoot | undefined
}

export const removeActionQueue = (queueHandle: ActionQueueHandle) => {
  HyperFlux.store.actions.queues.delete(queueHandle)
}

export const dispatchSchemaAction = <T extends string, S extends Schema & { [Kind]: 'Object' }>(
  creator: ActionCreator<Static<S> & Record<string, any>, T>,
  partial?: Partial<Static<S>> & ActionOptions
) => dispatchAction(creator(partial as any))
