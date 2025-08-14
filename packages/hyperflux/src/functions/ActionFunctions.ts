import { v4 as uuidv4 } from 'uuid'

import { createHookableFunction } from './createHookableFunction'

import { OpaqueType } from '../types/OpaqueType'
import { NetworkID, PeerID, UserID } from '../types/Types'
import { isDev } from './EnvironmentConstants'
import { ReactorReconciler, ReactorRoot } from './ReactorFunctions'
import { setInitialState, StateDefinitions } from './StateFunctions'
import { HyperFlux } from './StoreFunctions'

/**
 * NOTE: ts-matches has been fully removed.
 * All action definitions now rely on JSON Schema definitions (see ecs JSONSchemaUtils).
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore (cross package path may be adjusted later)
import type { JSONSchema } from '../../ecs/src/schemas/JSONSchemaUtils'

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

// Backwards compatibility alias (legacy code may still reference ResolvedActionType)
// After migration, replace those references directly with AnyAction.
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

// ---------------------------------------------------------------------------
// JSON Schema Validation / Defaults (lightweight; no external libs)
// ---------------------------------------------------------------------------
const validateJSONSchemaValue = (schema: JSONSchema | undefined, value: any, path: string, errors: string[]) => {
  if (!schema) return
  const type = (schema as any).type
  const currentPath = path || '(root)'
  if ((schema as any).oneOf && (schema as any).oneOf.length) {
    const variants: JSONSchema[] = (schema as any).oneOf
    const snapshots: string[][] = []
    for (const variant of variants) {
      const sub: string[] = []
      validateJSONSchemaValue(variant, value, currentPath, sub)
      if (!sub.length) return
      snapshots.push(sub)
    }
    errors.push(`Value at ${currentPath} failed all oneOf variants. First errors: ${snapshots[0]?.join('; ')}`)
    return
  }
  if ((schema as any).enum) {
    if (!(schema as any).enum.includes(value))
      errors.push(`Value at ${currentPath} not in enum ${(schema as any).enum.join(',')}`)
    return
  }
  if ((schema as any).const !== undefined) {
    if (value !== (schema as any).const) errors.push(`Value at ${currentPath} !== const ${(schema as any).const}`)
    return
  }
  switch (type) {
    case 'string':
      if (typeof value !== 'string') errors.push(`Expected string at ${currentPath}`)
      break
    case 'number':
      if (typeof value !== 'number') errors.push(`Expected number at ${currentPath}`)
      break
    case 'boolean':
      if (typeof value !== 'boolean') errors.push(`Expected boolean at ${currentPath}`)
      break
    case 'object': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push(`Expected object at ${currentPath}`)
        return
      }
      const req: string[] | undefined = (schema as any).required
      if (req)
        for (const r of req)
          if (!(r in value)) errors.push(`Missing required ${currentPath === '(root)' ? r : currentPath + '.' + r}`)
      if (schema.properties) {
        for (const [k, sub] of Object.entries(schema.properties)) {
          if (value[k] !== undefined)
            validateJSONSchemaValue(sub, value[k], currentPath === '(root)' ? k : currentPath + '.' + k, errors)
        }
      }
      break
    }
    case 'array': {
      if (!Array.isArray(value)) {
        errors.push(`Expected array at ${currentPath}`)
        return
      }
      if (schema.items) {
        for (let i = 0; i < value.length; i++)
          validateJSONSchemaValue(schema.items, value[i], `${currentPath}[${i}]`, errors)
      }
      break
    }
    default:
      break
  }
}

const applyDefaultsFromSchema = (schema: JSONSchema | undefined, target: any): any => {
  if (!schema) return target
  if ((schema as any).default !== undefined && target === undefined) return (schema as any).default
  switch (schema.type) {
    case 'object': {
      if (!target || typeof target !== 'object' || Array.isArray(target)) target = {}
      if (schema.properties) {
        for (const [k, sub] of Object.entries(schema.properties)) {
          const applied = applyDefaultsFromSchema(sub, target[k])
          target[k] = applied === undefined ? target[k] : applied
        }
      }
      break
    }
    case 'array':
      if (!Array.isArray(target)) target = []
      break
    default:
      if ((schema as any).default !== undefined && target === undefined) return (schema as any).default
  }
  return target
}

// ---------------------------------------------------------------------------
// Action Definition API
// ---------------------------------------------------------------------------
export type ActionCreator<P extends Record<string, any>, TType extends string> = {
  (partial?: Partial<P> & ActionOptions): AnyAction & P & { type: TType | string[] }
  type: TType
  schema: JSONSchema
  defaults: () => Partial<P>
  validate: (payload: unknown) => payload is P
  extend: <CT extends string, CP extends Record<string, any>>(def: {
    type: CT
    schema: JSONSchema
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

export function defineAction<TType extends string, S extends JSONSchema, P extends Record<string, any>>(def: {
  type: TType | [TType, ...string[]]
  schema: S
  defaults?: Partial<P> | (() => Partial<P>)
  meta?: Partial<ActionOptions>
}): ActionCreator<P, TType> {
  const typeChain = Array.isArray(def.type) ? def.type : [def.type]
  const primaryType = typeChain[0] as TType
  const getDefaults = (): Partial<P> =>
    (typeof def.defaults === 'function' ? (def.defaults as any)() : def.defaults) || {}

  const validate = (payload: unknown): payload is P => {
    const errors: string[] = []
    validateJSONSchemaValue(def.schema, payload, '', errors)
    return !errors.length
  }

  const creator = ((partial?: Partial<P> & ActionOptions) => {
    const payload: any = {}
    for (const [k, sub] of Object.entries(def.schema.properties || {}))
      payload[k] = applyDefaultsFromSchema(sub, undefined)
    Object.assign(payload, getDefaults())
    if (partial) for (const [k, v] of Object.entries(partial)) if (!k.startsWith('$')) payload[k] = v

    const errors: string[] = []
    validateJSONSchemaValue(def.schema, payload, '', errors)
    if (errors.length) throw new Error(`Schema validation failed for action ${primaryType}:\n${errors.join('\n')}`)

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
      schema: ext.schema,
      defaults: ext.defaults
    }) as any
  creator.matches = (a: AnyAction): a is AnyAction & P & { type: TType | string[] } => {
    if (!a || !a.type) return false
    const types = Array.isArray(a.type) ? a.type : [a.type]
    if (!types.includes(primaryType)) return false
    const subset: any = {}
    for (const key of Object.keys(def.schema.properties || {})) subset[key] = (a as any)[key]
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

// ---------------------------------------------------------------------------
// Dispatch & Processing Pipeline (unchanged semantics)
// ---------------------------------------------------------------------------
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

  // Cast to a stricter internal representation where required meta are non-optional
  const internal = action as Required<Pick<ActionOptions, '$uuid' | '$time' | '$topic' | '$to' | '$peer' | '$user'>> &
    AnyAction

  HyperFlux.store.actions.incoming.push(internal as any)
  addOutgoingTopicIfNecessary(topic)
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
    if (queueHandle.test(action)) {
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
  // receptor execution errors handled downstream; leaving placeholder for future logging hook
  const messageStackError = (e: any) => {
    const message = (e as Error).message
    const stack = (e as Error).stack?.split('\n') || []
    stack.shift()
    action.$ERROR = { message, stack }
    HyperFlux.store.logger('hyperflux:action').error(e)
  }
  try {
    /* no-op */
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
    if (action.$uuid && outgoingActions.forwardedUUIDs.has(action.$uuid))
      return // Relax typing: queue can store partial meta actions
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

// ---------------------------------------------------------------------------
// Action Queues
// ---------------------------------------------------------------------------
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

export const createActionQueue = defineActionQueue // deprecated alias

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

// Convenience helper for schema-based creators
export const dispatchSchemaAction = <T extends string, P extends Record<string, any>>(
  creator: ActionCreator<P, T>,
  partial?: Partial<P> & ActionOptions
) => dispatchAction(creator(partial))
