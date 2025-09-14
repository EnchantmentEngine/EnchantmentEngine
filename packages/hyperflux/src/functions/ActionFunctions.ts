import { v4 as uuidv4 } from 'uuid'

import type { SchemaDefinition, Static } from '../schemas/JSONSchemaTypes'
import { Kind } from '../schemas/JSONSchemaTypes'
import { CheckSchemaValue, CreateSchemaValue } from '../schemas/JSONSchemaUtils'
import { OpaqueType } from '../types/OpaqueType'
import { NetworkID, PeerID, UserID } from '../types/Types'
import { createHookableFunction } from './createHookableFunction'
import { isDev } from './EnvironmentConstants'
import { ReactorReconciler, ReactorRoot } from './ReactorFunctions'
import { setInitialState, StateDefinitions } from './StateFunctions'
import { HyperFlux } from './StoreFunctions'

export type Topic = OpaqueType<'Topic'> & string

/** Generic action (flat payload + meta) */
export type Action = {
  /**
   * The type of action
   */
  type: string | string[]
} & ActionOptions

export type ActionRecipients = PeerID | PeerID[] | 'all' | null | undefined

export type ActionOptions = {
  /**
   * The uuid of this action, uniquely identifying it
   */
  $uuid?: string

  /**
   * The id of the dispatching peer's unique identifier
   * Will be undefined if dispatched locally or not in a network
   * - It is recommended that transports implement this upon receiving actions to ensure the peer is who they say they are
   */
  $peer?: PeerID

  /**
   * The user that dispatched this action
   * Will be undefined if dispatched locally or not authenticated
   * - It is recommended that transports implement this upon receiving actions to ensure the user is who they say they are
   */
  $user?: UserID

  /**
   * The intended recipients
   */
  $to?: ActionRecipients

  /**
   * The intended time for this action to be applied
   * - If this option is missing, the action is applied the next time applyIncomingActions() is called.
   * - If this action is received late (after the desired tick has passed), it is dispatched on the next tick.
   */
  $time?: number | undefined

  /**
   * The network type for which to send this action to
   */
  $topic?: Topic

  /**
   * Optionally specify the network to send this action to.
   * Specifying this will not send the action to other networks.
   */
  $network?: NetworkID | undefined

  /**
   * The call stack at the time the action was dispatched
   */
  $stack?: string[]

  /**
   * An error that occurred while applying this action
   */
  $ERROR?: { message: string; stack: string[] }
}

export type ResolvedActionType<Shape = any> = Action

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
// Action Definition API (compiled schemas)
// -------------------------------------------------------------
export type ActionCreator<P extends Record<string, any>, TType extends string> = {
  (partial?: Partial<P> & ActionOptions): Action & P & { type: TType | string[] }
  type: TType
  schema: SchemaDefinition
  validate: (payload: unknown) => payload is P
  extend: <CT extends string, CS extends SchemaDefinition, CP extends Record<string, any>>(def: {
    type: CT
    schema: CS
  }) => ActionCreator<CP, CT>
  receive: (fn: (action: Action & P & { type: TType | string[] }) => void) => ActionReceptor<P, TType>
  matches: (a: Action) => a is Action & P & { type: TType | string[] }
  matchesAction: { test: (a: Action) => boolean }
}

export type ActionReceptor<P extends Record<string, any>, TType extends string> = ((
  action: Action & P & { type: TType | string[] }
) => void) & {
  matchesAction: { test: (a: Action) => boolean }
  validate: (filter: (action: Action & P & { type: TType | string[] }) => boolean) => ActionReceptor<P, TType>
  validator?: (action: Action & P & { type: TType | string[] }) => boolean
}

export function isActionReceptor(f: any): f is ActionReceptor<any, any> {
  return !!f && typeof f === 'function' && !!f.matchesAction
}

export const ActionDefinitions: Record<string, ActionCreator<any, string>> = {}

export function defineAction<TType extends string, S extends SchemaDefinition & { [Kind]: 'Object' }>(def: {
  type: TType | [TType, ...string[]]
  schema: S
  meta?: Partial<ActionOptions>
}): ActionCreator<Static<S> & Record<string, any>, TType> {
  type P = Static<S> & Record<string, any>
  const typeChain = Array.isArray(def.type) ? def.type : [def.type]
  const primaryType = typeChain[0] as TType

  const validate = (payload: unknown): payload is P => {
    return CheckSchemaValue(def.schema, payload)
  }

  const creator = ((partial?: Partial<P> & ActionOptions) => {
    const payload: any = CreateSchemaValue(def.schema)
    if (partial) for (const [k, v] of Object.entries(partial)) if (!k.startsWith('$')) payload[k] = v

    if (!CheckSchemaValue(def.schema, payload)) throw new Error(`Schema validation failed for action ${primaryType}`)

    const action: Action = {
      ...payload,
      type: typeChain.length === 1 ? primaryType : typeChain
    }

    if (partial) for (const [k, v] of Object.entries(partial)) if (k.startsWith('$')) (action as any)[k] = v
    if (def.meta) Object.assign(action, def.meta)

    return action as Action & P & { type: TType | string[] }
  }) as ActionCreator<P, TType>

  creator.type = primaryType
  creator.schema = def.schema
  creator.validate = validate
  creator.extend = (ext) =>
    defineAction({
      type: [ext.type, ...typeChain],
      schema: ext.schema as any
    }) as any
  creator.matches = (a: Action): a is Action & P & { type: TType | string[] } => {
    if (!a || !a.type) return false
    const types = Array.isArray(a.type) ? a.type : [a.type]
    if (!types.includes(primaryType)) return false
    const subset: any = {}
    if ((def.schema as any)[Kind] === 'Object') {
      for (const key of Object.keys((def.schema as any).properties || {})) subset[key] = (a as any)[key]
    }
    return validate(subset)
  }
  creator.matchesAction = { test: (a: Action) => creator.matches(a) }
  creator.receive = (receptor) => {
    const hookable = createHookableFunction(receptor) as any
    hookable.matchesAction = { test: (a: Action) => creator.matches(a) }
    hookable.validate = (fn: any) => {
      hookable.validator = fn
      return hookable
    }
    return hookable as ActionReceptor<P, TType>
  }

  ActionDefinitions[primaryType] = creator as any
  return creator
}

/**
 * Dispatch actions to the store.
 * @param action
 */
export const dispatchAction = <A extends Action>(_action: A) => {
  const action = JSON.parse(JSON.stringify(_action)) as A

  const peerID = HyperFlux.store.peerID
  const agentID = HyperFlux.store.getAgentID()

  action.$peer = action.$peer ?? peerID
  action.$user = action.$user ?? agentID
  action.$to = action.$to ?? 'all'
  action.$time = action.$time ?? HyperFlux.store.getDispatchTime() + HyperFlux.store.defaultDispatchDelay()
  action.$uuid = action.$uuid ?? uuidv4()
  action.$topic = action.$topic ?? HyperFlux.store.defaultTopic
  const topic = action.$topic

  if (isDev && !action.$stack) {
    const trace = { stack: '' }
    Error.captureStackTrace?.(trace, dispatchAction) // In firefox captureStackTrace is undefined
    const stack = trace.stack.split('\n')
    stack.shift()
    action.$stack = stack
  }

  const internal = action as Required<Pick<ActionOptions, '$uuid' | '$time' | '$topic' | '$to' | '$peer' | '$user'>> &
    Action

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

const applyIncomingActionsToAllQueues = (action: Required<ResolvedActionType>) => {
  for (const [queueHandle, queue] of HyperFlux.store.actions.queues) {
    if (queueHandle.test(action)) {
      // if the action is out of order, mark the queue as needing resync
      if (queue.actions.length > 0) {
        const last = queue.actions.at(-1) as Action
        if (last && last.$time !== undefined && action.$time !== undefined && last.$time > action.$time)
          queue.needsResync = true
      }
      queue.actions.push(action as Action)
    }
  }
}

const createEventSourceQueues = (action: Action) => {
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

const _applyIncomingAction = (action: Action) => {
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
    HyperFlux.store.actions.history.push(action as Action)
    if (action.$uuid) HyperFlux.store.actions.knownUUIDs.add(action.$uuid)
    const idx = HyperFlux.store.actions.incoming.indexOf(action as any)
    if (idx !== -1) HyperFlux.store.actions.incoming.splice(idx, 1)
  }
}

const _forwardIfNecessary = (action: Action) => {
  if (!action.$topic) return
  addOutgoingTopicIfNecessary(action.$topic as Topic)
  if (HyperFlux.store.peerID === action.$peer || HyperFlux.store.forwardingTopics.has(action.$topic as Topic)) {
    const outgoingActions = HyperFlux.store.actions.outgoing[action.$topic as Topic]
    if (!outgoingActions) return
    if (action.$uuid && outgoingActions.forwardedUUIDs.has(action.$uuid)) return
    ;(outgoingActions.queue as Action[]).push(action)
    if (action.$uuid) outgoingActions.forwardedUUIDs.add(action.$uuid)
  }
}

const applyEventSourcingToAllQueues = () => {
  for (const receptors of Object.values(HyperFlux.store.receptors)) receptors()
}

export const applyIncomingActions = () => {
  const incoming = HyperFlux.store.actions.incoming as Action[]
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
export type ActionMatcher = { test: (a: Action) => boolean }

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
    const result = queueInstance.actions.slice(queueInstance.nextIndex) as Action[]
    queueInstance.nextIndex = queueInstance.actions.length
    return result
  }

  ;(actionQueueGetter as any).test = (a: Action) => shapes.some((s) => s.test(a))
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
      .filter((a: Action) => (actionQueueGetter as any).test(a))
      .sort((a: Action, b: Action) => (a.$time || 0) - (b.$time || 0))
    queue.nextIndex = 0
    ;(actionQueueGetter as any).needsResync = false
  }

  return actionQueueGetter as any
}

export const createActionQueue = defineActionQueue

export type ActionQueueHandle = ReturnType<typeof defineActionQueue>
export type ActionQueueInstance = {
  actions: Action[]
  nextIndex: number
  needsResync: boolean
  reactorRoot: ReactorRoot | undefined
}

export const removeActionQueue = (queueHandle: ActionQueueHandle) => {
  HyperFlux.store.actions.queues.delete(queueHandle)
}

export const dispatchSchemaAction = <T extends string, S extends SchemaDefinition & { [Kind]: 'Object' }>(
  creator: ActionCreator<Static<S> & Record<string, any>, T>,
  partial?: Partial<Static<S>> & ActionOptions
) => dispatchAction(creator(partial as any))
