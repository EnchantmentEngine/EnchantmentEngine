import { v4 as uuidv4 } from 'uuid'

import { Schema } from '../schemas/JSONSchemas'
import type { MergeObjectSchemas, Static, TObjectSchema, TProperties } from '../schemas/JSONSchemaTypes'
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

export type ResolvedAction<
  TType extends string,
  Properties extends TProperties,
  Schema extends TObjectSchema<Properties>
> = Required<Action> & Static<Schema> & { type: TType | string[] }

export interface ActionCreator<
  TType extends string,
  Properties extends TProperties,
  Schema extends TObjectSchema<Properties>
> {
  (partial?: Partial<Static<Schema>> & ActionOptions): ResolvedAction<TType, Properties, Schema>
  type: TType | string[]
  _TYPE: ResolvedAction<TType, Properties, Schema> // hack to get the type of the action at compile time
  schema: Schema
  validate: (payload: unknown) => payload is Static<Schema>
  extend: <ExtendSchema extends TObjectSchema<any>>(
    extensionDefinition: ExtendSchema
  ) => MergeObjectSchemas<Schema, ExtendSchema>
  test: (a: Action) => a is ResolvedAction<TType, Properties, Schema>
  receive: (
    receptor: (action: ResolvedAction<TType, Properties, Schema>) => void
  ) => ActionReceptor<Properties, Schema, TType>
}

export type ActionReceptor<
  Properties extends TProperties,
  Schema extends TObjectSchema<Properties>,
  TType extends string
> = ((action: ResolvedAction<TType, Properties, Schema>) => void) & {
  action: ActionCreator<TType, Properties, Schema>
  validate: (
    filter: (action: ResolvedAction<TType, Properties, Schema>) => boolean
  ) => ActionReceptor<Properties, Schema, TType>
  validator?: (action: ResolvedAction<TType, Properties, Schema>) => boolean
}

export function isActionReceptor(f: any): f is ActionReceptor<any, any, any> {
  return !!f && typeof f === 'function' && !!f.matchesAction
}

export const ActionDefinitions: Record<string, ActionCreator<string, any, any>> = {}

export function defineAction<
  TType extends string,
  Properties extends TProperties,
  Schema extends TObjectSchema<Properties>
>(definition: Schema): ActionCreator<TType, Properties, Schema> {
  type P = Static<Schema>
  if (!definition.options?.$id) throw new Error('Action schema must have an id in options.$id')
  const typeChain = Array.isArray(definition.options.$id) ? definition.options.$id : [definition.options.$id]
  const primaryType = typeChain[0] as TType

  const validate = (payload: unknown): payload is P => {
    return CheckSchemaValue(definition, payload)
  }

  const creator = ((partial: P & ActionOptions) => {
    const payload = CreateSchemaValue(definition)
    if (partial) {
      for (const [k, v] of Object.entries(partial)) {
        if (!k.startsWith('$') && v !== undefined) payload[k] = v
      }
    }

    if (!CheckSchemaValue(definition, payload)) throw new Error(`Schema validation failed for action ${primaryType}`)

    const metadata = definition.options?.metadata ?? {}
    const action: Action = {
      ...metadata,
      ...payload,
      type: typeChain.length === 1 ? primaryType : typeChain
    }

    if (partial) for (const [k, v] of Object.entries(partial)) if (k.startsWith('$')) action[k] = v

    return action as Action & P & { type: TType | string[] }
  }) as ActionCreator<TType, Properties, Schema>

  creator.type = typeChain.length === 1 ? primaryType : typeChain
  creator.schema = definition
  creator.validate = validate
  creator.extend = (extensionDefinition) => {
    if (!extensionDefinition.options?.$id) throw new Error('Action schema must have an id in options.$id')
    const combinedID = Array.isArray(extensionDefinition.options.$id)
      ? [...extensionDefinition.options.$id, ...typeChain]
      : [extensionDefinition.options.$id, ...typeChain]
    const combinedProperties = {
      ...(definition.properties || {}),
      ...(extensionDefinition.properties || {})
    } as TProperties
    const metadata = {
      ...definition.options?.metadata,
      ...extensionDefinition.options?.metadata
    }
    return Schema.Object(combinedProperties, { $id: combinedID as any, metadata }) as any
  }
  creator.test = (a: Required<Action>): a is ResolvedAction<TType, Properties, Schema> => {
    if (!a || !a.type) return false
    const types = Array.isArray(a.type) ? a.type : [a.type]
    if (!types.includes(primaryType)) return false
    const subset = {}
    for (const key of Object.keys(definition.properties || {})) subset[key] = a[key]
    return validate(subset)
  }
  creator.receive = (receptor) => {
    const hookable = createHookableFunction(receptor) as any
    hookable.action = creator
    hookable.validate = (fn) => {
      hookable.validator = fn
      return hookable
    }
    return hookable as ActionReceptor<Properties, Schema, TType>
  }

  ActionDefinitions[primaryType] = creator
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

  HyperFlux.store.actions.incoming.push(action as Required<Action>)
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

const applyIncomingActionsToAllQueues = (action: Required<Action>) => {
  for (const [queueHandle, queue] of HyperFlux.store.actions.queues) {
    if (queueHandle.test(action)) {
      // if the action is out of order, mark the queue as needing resync
      if (queue.actions.length > 0) {
        const last = queue.actions.at(-1)
        if (last && last.$time !== undefined && action.$time !== undefined && last.$time > action.$time)
          queue.needsResync = true
      }
      queue.actions.push(action)
    }
  }
}

const createEventSourceQueues = (action: Action) => {
  for (const definition of StateDefinitions.values()) {
    if (!definition.receptors || HyperFlux.store.receptors[definition.name]) continue

    const matchedActions = Object.values(definition.receptors).map((r: ActionReceptor<any, any, any>) => r.action)
    if (!matchedActions.some((m) => m.test(action))) continue

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
            const receptor = defReceptor as ActionReceptor<any, any, any>
            if (receptor.action.test(act)) {
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

const _applyIncomingAction = (action: Required<Action>) => {
  if (action.$uuid && HyperFlux.store.actions.knownUUIDs.has(action.$uuid)) {
    try {
      JSON.stringify(action)
    } catch {
      console.log('error in logging repeat action', action)
    }
    const idx = HyperFlux.store.actions.incoming.indexOf(action)
    if (idx !== -1) HyperFlux.store.actions.incoming.splice(idx, 1)
    return
  }
  createEventSourceQueues(action)
  applyIncomingActionsToAllQueues(action)
  const messageStackError = (e: Error) => {
    const message = e.message
    const stack = e.stack?.split('\n') || []
    stack.shift()
    action.$ERROR = { message, stack }
    HyperFlux.store.logger('hyperflux:action').error(e)
  }
  try {
    /* receptor execution handled separately */
  } catch (e) {
    messageStackError(e)
  } finally {
    HyperFlux.store.actions.history.push(action)
    if (action.$uuid) HyperFlux.store.actions.knownUUIDs.add(action.$uuid)
    const idx = HyperFlux.store.actions.incoming.indexOf(action)
    if (idx !== -1) HyperFlux.store.actions.incoming.splice(idx, 1)
  }
}

const _forwardIfNecessary = (action: Required<Action>) => {
  if (!action.$topic) return
  addOutgoingTopicIfNecessary(action.$topic as Topic)
  if (HyperFlux.store.peerID === action.$peer || HyperFlux.store.forwardingTopics.has(action.$topic as Topic)) {
    const outgoingActions = HyperFlux.store.actions.outgoing[action.$topic as Topic]
    if (!outgoingActions) return
    if (action.$uuid && outgoingActions.forwardedUUIDs.has(action.$uuid)) return
    outgoingActions.queue.push(action)
    if (action.$uuid) outgoingActions.forwardedUUIDs.add(action.$uuid)
  }
}

const applyEventSourcingToAllQueues = () => {
  for (const receptors of Object.values(HyperFlux.store.receptors)) receptors()
}

export const applyIncomingActions = () => {
  const incoming = HyperFlux.store.actions.incoming
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

export type ActionMatcher<A extends Action> = (a: A) => boolean

export function defineActionQueue<A extends ActionCreator<any, any, any>>(actionDefinition: A | A[]) {
  const actionDefinitions = Array.isArray(actionDefinition) ? actionDefinition : [actionDefinition]

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
    return queueInstance as ActionQueueInstance<A>
  }

  const actionQueueGetter: ActionQueueHandle<A> = () => {
    const queueInstance = getOrCreateInstance()
    const result = queueInstance.actions.slice(queueInstance.nextIndex)
    queueInstance.nextIndex = queueInstance.actions.length
    return result
  }

  actionQueueGetter.test = (a: A) => actionDefinitions.some((s) => s.test(a))

  actionQueueGetter.instance = null as any
  Object.defineProperty(actionQueueGetter, 'instance', {
    get: () => getOrCreateInstance(),
    set: (val) => {
      throw new Error('Cannot set instance of ActionQueueHandle')
    }
  })

  actionQueueGetter.needsResync = false
  Object.defineProperty(actionQueueGetter, 'needsResync', {
    get: () => getOrCreateInstance().needsResync,
    set: (val) => {
      getOrCreateInstance().needsResync = val
    }
  })
  actionQueueGetter.resync = () => {
    const queue = getOrCreateInstance()
    queue.actions = HyperFlux.store.actions.history
      .filter((a: Action) => actionQueueGetter.test(a))
      .sort((a: A['_TYPE'], b: A['_TYPE']) => (a.$time || 0) - (b.$time || 0)) as A['_TYPE'][]
    queue.nextIndex = 0
    queue.needsResync = false
  }

  return actionQueueGetter
}

export type ActionQueueHandle<A extends ActionCreator<any, any, any>> = {
  (): A['_TYPE'][]
  test: (a: A['_TYPE']) => boolean
  needsResync: boolean
  instance: ActionQueueInstance<A>
  resync: () => void
}

export type ActionQueueInstance<A extends ActionCreator<any, any, any>> = {
  actions: A['_TYPE'][]
  nextIndex: number
  needsResync: boolean
  reactorRoot: ReactorRoot | undefined
}

export const removeActionQueue = <A extends ActionCreator<any, any, any>>(queueHandle: ActionQueueHandle<A>) => {
  HyperFlux.store.actions.queues.delete(queueHandle)
}
