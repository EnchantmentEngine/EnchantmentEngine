import assert from 'assert'
import { describe, it } from 'vitest'

import { PeerID, Schema } from '@ir-engine/hyperflux'

import {
  applyIncomingActions,
  clearOutgoingActions,
  createHyperStore,
  defineAction,
  defineActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  removeActionQueue
} from '..'

// Since defineAction now expects a compiled Schema, build them with Schema helpers.
const emptyObjectSchema = Schema.Object({})
const patternSchema = Schema.Object({
  payload: Schema.String(),
  optionalThing: Schema.Optional(Schema.Number())
})

// Helper to build a basic greeting action with default greeting (schema field default)
const makeGreetingAction = (type: string, defaultGreeting: string) =>
  defineAction({
    type,
    schema: Schema.Object({ greeting: Schema.String({ default: defaultGreeting }) })
  })

describe('Hyperflux Unit Tests (Compiled Schema Actions)', () => {
  it('should define and create a simple action', () => {
    const test = defineAction({ type: 'TEST_ACTION', schema: emptyObjectSchema })
    const action = test({})
    assert.equal(action.type, 'TEST_ACTION')
    assert(test.matchesAction.test(action))
    assert(test.matches(action))
    assert.equal(test.matches({ type: 'FAIL' } as any), false)
  })

  it('should define and create actions with required + optional fields', () => {
    const test = defineAction({
      type: 'TEST_PATTERN',
      schema: patternSchema
    })
    const action = test({ payload: 'abcd', $cache: false })
    assert.equal(action.type, 'TEST_PATTERN')
    assert.equal(action.optionalThing, undefined)
    assert(action.$cache === false)
    assert(test.matches(action))
  })

  it('should support default values (dynamic)', () => {
    let count = 0
    const dynamicDefaultsSchema = Schema.Object({
      count: Schema.Number({ default: () => count++ }),
      greeting: Schema.String({ default: 'hi' })
    })
    const test = defineAction({
      type: 'TEST_DEFAULT_VALUES',
      schema: dynamicDefaultsSchema
    })
    assert.equal(test({}).count, 0)
    assert.equal(test({}).count, 1)
    assert.equal(test({}).count, 2)
    assert.equal(test({}).count, 3)
    const action = test({})
    assert.equal(action.count, 4)
    assert.equal(action.greeting, 'hi')
    const action2 = test({ greeting: 'hello' })
    assert.equal(action2.count, 5)
    assert.equal(action2.greeting, 'hello')
    assert(test.matches(action2))
  })

  it('should dispatch an action to a local store', () => {
    const store = createHyperStore({ getDispatchTime: () => Date.now() })
    const greet = makeGreetingAction('TEST_GREETING', 'hi')
    dispatchAction(greet({}))
    assert.equal(store.actions.incoming.length, 1)
    assert(greet.matchesAction.test(store.actions.incoming[0]))
    assert(store.actions.incoming[0].$to == 'all')
    assert(store.actions.incoming[0].$time! <= Date.now())
    assert(store.actions.incoming[0].$cache === false)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 1)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    clearOutgoingActions(store.defaultTopic)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
  })

  it('should dispatch an action to a peer store', () => {
    const store = createHyperStore({ getDispatchTime: () => Date.now() })
    const greet = makeGreetingAction('TEST_GREETING', 'hi')
    dispatchAction(greet({}))
    applyIncomingActions()
    assert.equal(store.actions.history.length, 1)
  })

  it('should dispatch an action to a host store', () => {
    const store = createHyperStore({ getDispatchTime: () => Date.now() })
    const greet = makeGreetingAction('TEST_GREETING', 'hi')
    dispatchAction(greet({}))
    assert(greet.matches(store.actions.incoming[0]))
    assert.equal(store.actions.incoming.length, 1)
    applyIncomingActions()
    clearOutgoingActions(store.defaultTopic)
  })

  it('should add incoming actions to cache as indicated', () => {
    const store = createHyperStore({ getDispatchTime: () => Date.now() })
    const greet = makeGreetingAction('TEST_GREETING', 'hi')

    dispatchAction(greet({ $cache: true }))
    dispatchAction(greet({ $cache: false }))
    dispatchAction(greet({ $cache: true }))
    dispatchAction(greet({ $cache: true }))
    dispatchAction(greet({ $cache: true }))
    applyIncomingActions()

    assert.equal(store.actions.history.length, 5)
    assert.equal(store.actions.cached.length, 4)

    dispatchAction(greet({ $cache: { removePrevious: true } }))
    applyIncomingActions()
    assert.equal(store.actions.history.length, 6)
    assert.equal(store.actions.cached.length, 1)

    dispatchAction(greet({ $cache: true }))
    dispatchAction(greet({ $cache: true }))
    dispatchAction(greet({ $cache: true }))
    let greetAction = greet({ greeting: 'welcome', $cache: true })
    dispatchAction(greetAction)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 10)
    assert.equal(store.actions.cached.length, 5)
    assert.equal(store.actions.history.at(-1)!['greeting'], 'welcome')

    greetAction = greet({ greeting: 'welcome', $cache: { removePrevious: ['greeting'], disable: true } })
    dispatchAction(greetAction)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 11)
    assert.equal(store.actions.cached.length, 4)

    dispatchAction(greet({ $peer: 'differentPeer' as PeerID, $cache: { removePrevious: true } }))
    applyIncomingActions()
    assert.equal(store.actions.history.length, 12)

    dispatchAction(greet({ $cache: { removePrevious: true, disable: true } }))
    applyIncomingActions()
    assert.equal(store.actions.history.length, 13)

    dispatchAction(greet({ $peer: 'differentPeer' as PeerID, $cache: { removePrevious: true, disable: true } }))
    applyIncomingActions()
    assert.equal(store.actions.history.length, 14)
  })

  it('should apply incoming actions to receptors', () => {
    const store = createHyperStore({ getDispatchTime: () => Date.now() })
    const greet = makeGreetingAction('TEST_GREETING', 'hi')
    dispatchAction(greet({}))
    clearOutgoingActions(store.defaultTopic)
    assert(greet.matches(store.actions.incoming[0]))
    applyIncomingActions()
    assert(store.actions.history.length)
  })

  it('should apply multiple actions at once', () => {
    const store = createHyperStore({ getDispatchTime: () => Date.now() })
    const greet = makeGreetingAction('TEST_GREETING', 'hi')
    for (let i = 0; i < 4; i++) dispatchAction(greet({}))
    assert.equal(store.actions.history.length, 0)
    clearOutgoingActions(store.defaultTopic)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 4)
    store.actions.incoming.push(...(store.actions.outgoing[store.defaultTopic].history as any))
    applyIncomingActions()
    assert.equal(store.actions.history.length, 4)
  })

  it('should force resync for out-of-order actions', () => {
    const greet = makeGreetingAction('TEST_GREETING', 'hi')
    const goodbye = makeGreetingAction('TEST_GOODBYE', 'bye')
    const store = createHyperStore({ getDispatchTime: () => Date.now() })
    const queue = defineActionQueue([greet.matchesAction, goodbye.matchesAction])
    dispatchAction(goodbye({ $time: 200 }))
    dispatchAction(greet({ $time: 100 }))
    const pre = queue()
    assert.equal(pre.length, 0)
    applyIncomingActions()
    queue.resync()
    const actions = queue()
    assert.equal(actions.length, 2)
    assert(greet.matches(actions[0]))
    assert(goodbye.matches(actions[1]))
  })

  it('should manage multiple independent queues', () => {
    const greet = makeGreetingAction('TEST_GREETING', 'hi')
    const goodbye = makeGreetingAction('TEST_GOODBYE', 'bye')
    createHyperStore({ getDispatchTime: () => Date.now() })
    const queue1 = defineActionQueue([greet.matchesAction, goodbye.matchesAction])
    const queue2 = defineActionQueue([greet.matchesAction, goodbye.matchesAction])
    dispatchAction(goodbye({ $time: 200 }))
    dispatchAction(greet({ $time: 100 }))
    applyIncomingActions()
    queue1.resync()
    queue2.resync()
    assert.equal(queue1().length, 2)
    assert.equal(queue2().length, 2)
    removeActionQueue(queue1 as any)
    assert.equal(queue2().length, 0)
  })

  it('should reset queue on out-of-order follow-up actions', () => {
    const greet = makeGreetingAction('TEST_GREETING', 'hi')
    const goodbye = makeGreetingAction('TEST_GOODBYE', 'bye')
    createHyperStore({ getDispatchTime: () => Date.now() })
    const queue = defineActionQueue([greet.matchesAction, goodbye.matchesAction])
    dispatchAction(goodbye({ $time: 200 }))
    dispatchAction(greet({ $time: 100 }))
    applyIncomingActions()
    queue.resync()
    let actions = queue()
    assert.equal(actions.length, 2)
    dispatchAction(greet({ $time: 300 }))
    applyIncomingActions()
    actions = queue()
    assert.equal(actions.length, 1)
    dispatchAction(goodbye({ $time: 50 }))
    applyIncomingActions()
    queue.resync()
    actions = queue()
    assert(actions.length >= 3)
  })

  it('should create networked state with receptors', () => {
    const greet = makeGreetingAction('TEST_GREETING', 'hi')
    const goodbye = makeGreetingAction('TEST_GOODBYE', 'bye')

    const HospitalityState = defineState({
      name: 'test.hospitality',
      initial: () => ({ greetingCount: 0, firstGreeting: null as string | null }),
      receptors: {
        onGreet: greet.receive((action) => {
          const state = getMutableState(HospitalityState).greetingCount.set((v) => v + 1)
          if (!getMutableState(HospitalityState).firstGreeting.value)
            getMutableState(HospitalityState).firstGreeting.set(action.greeting)
        }),
        onGoodbye: goodbye.receive((action) => {
          const state = getMutableState(HospitalityState)
          state.greetingCount.set((v) => v - 1)
          if (!state.firstGreeting.value) state.firstGreeting.set(action.greeting)
        })
      }
    })

    createHyperStore({ getDispatchTime: () => Date.now() })
    const hospitality = getMutableState(HospitalityState)
    dispatchAction(greet({ $time: 100 }))
    dispatchAction(goodbye({ $time: 100 }))
    dispatchAction(greet({ $time: 100 }))
    applyIncomingActions()
    assert.equal(hospitality.greetingCount.value, 1)
    dispatchAction(goodbye({ $time: 50 }))
    applyIncomingActions()
    assert(hospitality.greetingCount.value <= 1)
  })
})
