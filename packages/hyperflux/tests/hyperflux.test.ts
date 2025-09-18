import assert from 'assert'
import { describe, it } from 'vitest'

import {
  applyIncomingActions,
  clearOutgoingActions,
  createHyperStore,
  defineAction,
  defineActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  removeActionQueue,
  Schema
} from '..'

describe('Hyperflux Unit Tests', () => {
  it('should be able to define and create an action', () => {
    const actionDefinition = defineAction(
      Schema.Object(
        {},
        {
          $id: 'TEST_ACTION'
        }
      )
    )
    // @ts-expect-error - should type error if providing unknown fields, but should pass pattern matching
    assert(actionDefinition.test(actionDefinition({ unknown: true })))
    const action = actionDefinition({})
    // assert the action has the correct type, both at runtime and compile time
    actionDefinition._TYPE === action // compile time check
    assert.equal(action.type, 'TEST_ACTION')
    assert(actionDefinition.test(action))
    assert(actionDefinition.test({ type: 'FAIL' }) === false)
  })

  it('should be able to define and create actions with pattern matching', () => {
    const actionDefinition = defineAction(
      Schema.Object(
        {
          payload: Schema.String({ required: true }),
          optionalThing: Schema.Union([Schema.Null(), Schema.Number()], { required: false })
        },
        {
          $id: 'TEST_PATTERN_MATCHING'
        }
      )
    )
    /** @todo we need to add types to schemas for required & default fields */
    // @ ts-expect-error - should type error if missing required fields, and should throw error
    // assert.throws(() => test({}))
    // @ts-expect-error - should type error if providing wrong type, and should throw error
    assert.throws(() => actionDefinition({ payload: 100 }))
    const action = actionDefinition({ payload: 'abcd' })
    assert.equal(action.type, 'TEST_PATTERN_MATCHING')
    assert.equal(action.optionalThing, null)
    assert(actionDefinition.test(action))
  })

  it('should be able to define and create actions with action options', () => {
    const actionDefinition = defineAction(
      Schema.Object(
        {},
        {
          $id: 'TEST_OPTIONS'
        }
      )
    )
    const action = actionDefinition({})
    assert(action.type === 'TEST_OPTIONS')
    assert(actionDefinition.test(action))
    assert(actionDefinition.test({ type: 'TEST' }) === false)
  })

  it('should be able to define and create actions with default values', () => {
    let count = 0
    const actionDefinition = defineAction(
      Schema.Object(
        {
          count: Schema.Number({ default: () => count++ }),
          greeting: Schema.String({ default: 'hi' })
        },
        {
          $id: 'TEST_DEFAULTS'
        }
      )
    )
    assert.equal(actionDefinition({}).count, 0)
    assert.equal(actionDefinition({}).count, 1)
    assert.equal(actionDefinition({}).count, 2)
    assert.equal(actionDefinition({}).count, 3)
    const action = actionDefinition({})
    assert.equal(action.count, 4)
    assert.equal(action.greeting, 'hi')
    const action2 = actionDefinition({ greeting: 'hello' })
    assert.equal(action2.count, 5)
    assert.equal(action2.greeting, 'hello')
    assert(actionDefinition.test(action2))
  })

  it('should be able to extend action definitions', () => {
    const BaseAction = defineAction(
      Schema.Object(
        {
          base: Schema.String({ default: 'base' })
        },
        {
          $id: 'BASE_ACTION'
        }
      )
    )
    const ExtendedAction = defineAction(
      BaseAction.extend(
        Schema.Object(
          {
            extended: Schema.String({ default: 'extended' })
          },
          { $id: 'EXTENDED_ACTION' }
        )
      )
    )
    const FurtherExtendedAction = defineAction(
      ExtendedAction.extend(
        Schema.Object(
          {
            further: Schema.String({ default: 'further' })
          },
          { $id: 'FURTHER_EXTENDED_ACTION' }
        )
      )
    )
    const action = FurtherExtendedAction({})
    assert.deepStrictEqual(action.type, ['FURTHER_EXTENDED_ACTION', 'EXTENDED_ACTION', 'BASE_ACTION'])
    assert.equal(action.base, 'base')
    assert.equal(action.extended, 'extended')
    assert.equal(action.further, 'further')
    assert(FurtherExtendedAction.test(action))
  })

  it('should extend action preserving metadata', () => {
    const BaseAction = defineAction(
      Schema.Object(
        {
          base: Schema.String({ default: 'base' })
        },
        {
          $id: 'BASE_ACTION',
          metadata: { $topic: 'topic' }
        }
      )
    )
    const ExtendedAction = defineAction(
      BaseAction.extend(
        Schema.Object(
          {
            extended: Schema.String({ default: 'extended' })
          },
          { $id: 'EXTENDED_ACTION' }
        )
      )
    )

    const action = ExtendedAction({})

    assert.deepStrictEqual(action.type, ['EXTENDED_ACTION', 'BASE_ACTION'])
    assert.equal(action.base, 'base')
    assert.equal(action.extended, 'extended')
    assert(ExtendedAction.test(action))
    assert.deepEqual(action.$topic, 'topic')
  })

  it('should be able to dispatch an action to a local store', () => {
    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction(
      Schema.Object(
        {
          greeting: Schema.String({ default: 'hi' })
        },
        {
          $id: 'TEST_GREETING'
        }
      )
    )
    dispatchAction(greet({}))
    assert.equal(store.actions.incoming.length, 1)
    assert(greet.test(store.actions.incoming[0]))
    assert(store.actions.incoming[0].$to == 'all')
    assert(store.actions.incoming[0].$time <= Date.now())
    applyIncomingActions()
    assert.equal(store.actions.history.length, 1)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    clearOutgoingActions(store.defaultTopic)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
  })

  it('should be able to dispatch an action to a peer store', () => {
    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GREETING' }),
          greeting: Schema.String({ default: 'hi' })
        },
        {
          $id: 'TEST_GREETING'
        }
      )
    )
    dispatchAction(greet({}))
    assert.equal(store.actions.incoming.length, 1)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 1)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 0)
    clearOutgoingActions(store.defaultTopic)
    assert.equal(store.actions.history.length, 1)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 1)
  })

  it('should be able to dispatch an action to a host store', () => {
    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction(
      Schema.Object(
        {
          greeting: Schema.String({ default: 'hi' })
        },
        {
          $id: 'TEST_GREETING'
        }
      )
    )
    dispatchAction(greet({}))
    assert(greet.test(store.actions.incoming[0]))
    assert.equal(store.actions.incoming.length, 1)
    assert(store.actions.incoming[0].$to == 'all')
    assert(store.actions.incoming[0].$time <= Date.now())
    applyIncomingActions()
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 1)
    clearOutgoingActions(store.defaultTopic)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
  })

  it('should be able to apply incoming actions to receptors in a peer store', () => {
    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GREETING' }),
          greeting: Schema.String({ default: 'hi' })
        },
        {
          $id: 'TEST_GREETING'
        }
      )
    )
    dispatchAction(greet({}))
    clearOutgoingActions(store.defaultTopic)
    assert(greet.test(store.actions.incoming[0]))
    applyIncomingActions()
    assert(store.actions.history.length)
  })

  it('should be able to apply multiple actions at once to a peer store', () => {
    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GREETING' }),
          greeting: Schema.String({ default: 'hi' })
        },
        {
          $id: 'TEST_GREETING'
        }
      )
    )
    dispatchAction(greet({}))
    dispatchAction(greet({}))
    dispatchAction(greet({}))
    dispatchAction(greet({}))
    assert.equal(store.actions.history.length, 0)
    clearOutgoingActions(store.defaultTopic)
    assert.equal(store.actions.history.length, 0)
    assert.equal(store.actions.incoming.length, 4)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
    store.actions.incoming.push(...store.actions.outgoing[store.defaultTopic].history)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
  })

  it('should be able to apply multiple actions at once to a host store', () => {
    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })
    const greet = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GREETING' }),
          greeting: Schema.String({ default: 'hi' })
        },
        {
          $id: 'TEST_GREETING'
        }
      )
    )
    dispatchAction(greet({}))
    dispatchAction(greet({}))
    dispatchAction(greet({}))
    dispatchAction(greet({}))
    assert.equal(store.actions.history.length, 0)
    assert.equal(store.actions.incoming.length, 4)
    clearOutgoingActions(store.defaultTopic)
    assert.equal(store.actions.history.length, 0)
    assert.equal(store.actions.incoming.length, 4)
    assert.equal(store.actions.history.length, 0)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 0)
    clearOutgoingActions(store.defaultTopic)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].forwardedUUIDs.size, 4)
    const history = Array.from(store.actions.history.values())
    assert.equal(history[1], store.actions.outgoing[store.defaultTopic].history[1])
    assert.equal(history[2], store.actions.outgoing[store.defaultTopic].history[2])
    assert.equal(history[3], store.actions.outgoing[store.defaultTopic].history[3])
    assert.equal(history[4], store.actions.outgoing[store.defaultTopic].history[4])
    assert.equal(store.actions.history.length, 4)
    store.actions.incoming.push(...store.actions.outgoing[store.defaultTopic].history)
    applyIncomingActions()
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.incoming.length, 0)
    assert.equal(store.actions.outgoing[store.defaultTopic].queue.length, 0)
    assert.equal(store.actions.history.length, 4)
    assert.equal(store.actions.knownUUIDs.size, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].history.length, 4)
    assert.equal(store.actions.outgoing[store.defaultTopic].forwardedUUIDs.size, 4)
  })

  it('should be able to define state and register it to a store', () => {
    const HospitalityState = defineState({
      name: 'test.hospitality.0',
      initial: () => ({
        greetingCount: 0,
        lastGreeting: null as string | null
      })
    })
    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })
    getState(HospitalityState)
    assert(store.stateMap['test.hospitality.0'])
  })

  it('should be able to get immutable registered state', () => {
    const HospitalityState = defineState({
      name: 'test.hospitality.2',
      initial: () => ({
        greetingCount: 0,
        lastGreeting: null as string | null
      })
    })
    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })
    const hospitality = getMutableState(HospitalityState).value
    assert(store.stateMap['test.hospitality.2'])
    assert.equal(hospitality.greetingCount, 0)
  })

  it('should be able to mutate registered state', () => {
    const HospitalityState = defineState({
      name: 'test.hospitality.3',
      initial: () => ({
        greetingCount: 0,
        lastGreeting: null as string | null
      })
    })

    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })

    const hospitality = getMutableState(HospitalityState)
    assert(store.stateMap['test.hospitality.3'])
    hospitality.greetingCount.set(100)

    assert.equal(getState(HospitalityState).greetingCount, 100)
  })

  it('should be able to create action queues', () => {
    const greet = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GREETING' }),
          greeting: Schema.String({ default: 'hi' })
        },
        {
          $id: 'TEST_GREETING'
        }
      )
    )
    const goodbye = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GOODBYE' }),
          greeting: Schema.String({ default: 'bye' })
        },
        {
          $id: 'TEST_GOODBYE'
        }
      )
    )
    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })
    const queue = defineActionQueue([greet, goodbye])
    assert.equal(queue().length, 0)
    dispatchAction(greet({}))
    dispatchAction(goodbye({}))
    assert.equal(queue().length, 0)
    dispatchAction(greet({}))
    dispatchAction(goodbye({}))
    applyIncomingActions()
    const actions = queue()
    assert.equal(actions.length, 4)
    assert(greet.test(actions[0]))
    assert(goodbye.test(actions[1]))
    assert(greet.test(actions[2]))
    assert(goodbye.test(actions[3]))
  })

  it('should be able to force a resync for action queues with out-of-order action', () => {
    const greet = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GREETING' }),
          greeting: Schema.String({ default: 'hi' })
        },
        {
          $id: 'TEST_GREETING'
        }
      )
    )
    const goodbye = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GOODBYE' }),
          greeting: Schema.String({ default: 'bye' })
        },
        {
          $id: 'TEST_GOODBYE'
        }
      )
    )
    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })

    const queue = defineActionQueue([greet, goodbye])
    dispatchAction(goodbye({ $time: 200 }))
    dispatchAction(greet({ $time: 100 }))

    // ensure queue instance exists
    const actionsPriorToApply = queue()

    assert.equal(actionsPriorToApply.length, 0)

    // populate queue
    applyIncomingActions()

    // manually force resync
    queue.resync()

    // receive queue
    const actions = queue()
    assert.equal(actions.length, 2)
    assert(greet.test(actions[0]))
    assert(goodbye.test(actions[1]))
  })

  it('should be able to create multiple action queues of the same type, that are independently managed', () => {
    const greet = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GREETING' }),
          greeting: Schema.String({ default: 'hi' })
        },
        {
          $id: 'TEST_GREETING'
        }
      )
    )
    const goodbye = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GOODBYE' }),
          greeting: Schema.String({ default: 'bye' })
        },
        {
          $id: 'TEST_GOODBYE'
        }
      )
    )
    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })

    const queue1 = defineActionQueue([greet, goodbye])
    const queue2 = defineActionQueue([greet, goodbye])
    dispatchAction(goodbye({ $time: 200 }))
    dispatchAction(greet({ $time: 100 }))
    applyIncomingActions()

    queue1.resync()
    queue2.resync()

    const actions1 = queue1()
    assert.equal(actions1.length, 2)
    assert(greet.test(actions1[0]))
    assert(goodbye.test(actions1[1]))
    removeActionQueue(queue1)

    const actions2 = queue2()
    assert.equal(actions2.length, 2)
    assert(greet.test(actions2[0]))
    assert(goodbye.test(actions2[1]))
  })

  it('should be able to create action queues that reset when given actions out of order', () => {
    const greet = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GREETING' }),
          greeting: Schema.String({ default: 'hi' })
        },
        {
          $id: 'TEST_GREETING'
        }
      )
    )
    const goodbye = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GOODBYE' }),
          greeting: Schema.String({ default: 'bye' })
        },
        {
          $id: 'TEST_GOODBYE'
        }
      )
    )
    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })

    const queue = defineActionQueue([greet, goodbye])
    dispatchAction(goodbye({ $time: 200 }))
    dispatchAction(greet({ $time: 100 }))
    applyIncomingActions()

    queue.resync()

    const actions1 = queue()
    assert.equal(actions1.length, 2)
    assert(greet.test(actions1[0]))
    assert(goodbye.test(actions1[1]))

    dispatchAction(greet({ $time: 300 }))
    applyIncomingActions()
    const actions2 = queue()
    assert.equal(actions2.length, 1)
    assert(greet.test(actions2[0]))

    dispatchAction(goodbye({ $time: 50 }))
    applyIncomingActions()
    queue.resync()

    const actions3 = queue()
    assert.equal(actions3.length, 4)
    assert(goodbye.test(actions3[0]))
    assert(greet.test(actions3[1]))
    assert(goodbye.test(actions3[2]))
    assert(greet.test(actions3[3]))
  })

  it('should be able to create networked state with receptors', () => {
    const greet = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GREETING' }),
          greeting: Schema.String({ default: 'hi' })
        },
        {
          $id: 'TEST_GREETING'
        }
      )
    )
    const goodbye = defineAction(
      Schema.Object(
        {
          type: Schema.String({ default: 'TEST_GOODBYE' }),
          greeting: Schema.String({ default: 'bye' })
        },
        {
          $id: 'TEST_GOODBYE'
        }
      )
    )

    const HospitalityState = defineState({
      name: 'test.hospitality',

      initial: () => ({
        greetingCount: 0,
        firstGreeting: null as string | null
      }),

      receptors: {
        onGreet: greet.receive((action) => {
          const state = getMutableState(HospitalityState)
          state.greetingCount.set((v) => v + 1)
          if (!state.firstGreeting.value) state.firstGreeting.set(action.greeting)
        }),
        onGoodbye: goodbye.receive((action) => {
          const state = getMutableState(HospitalityState)
          state.greetingCount.set((v) => v - 1)
          if (!state.firstGreeting.value) state.firstGreeting.set(action.greeting)
        })
      }
    })

    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })

    const hospitality = getMutableState(HospitalityState)

    dispatchAction(greet({ $time: 100 }))
    dispatchAction(goodbye({ $time: 100 }))
    dispatchAction(greet({ $time: 100 }))
    applyIncomingActions()

    assert.equal(hospitality.greetingCount.value, 1)
    assert.equal(hospitality.firstGreeting.value, 'hi')

    dispatchAction(goodbye({ $time: 50 }))
    applyIncomingActions()

    assert.equal(hospitality.greetingCount.value, 0)
    assert.equal(hospitality.firstGreeting.value, 'bye')
  })

  it('should be able to receive inherited actions in receptors', () => {
    const BaseAction = defineAction(Schema.Object({}, { $id: 'BASE_ACTION' }))
    const ExtendedAction = defineAction(BaseAction.extend(Schema.Object({}, { $id: 'EXTENDED_ACTION' })))
    const FurtherExtendedAction = defineAction(
      ExtendedAction.extend(Schema.Object({}, { $id: 'FURTHER_EXTENDED_ACTION' }))
    )
    const AnotherExtendedAction = defineAction(BaseAction.extend(Schema.Object({}, { $id: 'ANOTHER_EXTENDED_ACTION' })))

    const ActionState = defineState({
      name: 'test.actions',

      initial: () => ({
        baseCount: 0,
        extendedCount: 0,
        furtherCount: 0,
        anotherExtendedCount: 0
      }),

      receptors: {
        onBase: BaseAction.receive((action) => {
          const state = getMutableState(ActionState)
          state.baseCount.set((v) => v + 1)
        }),
        onExtended: ExtendedAction.receive((action) => {
          const state = getMutableState(ActionState)
          state.extendedCount.set((v) => v + 1)
        }),
        onFurther: FurtherExtendedAction.receive((action) => {
          const state = getMutableState(ActionState)
          state.furtherCount.set((v) => v + 1)
        }),
        onAnotherExtended: AnotherExtendedAction.receive((action) => {
          const state = getMutableState(ActionState)
          state.anotherExtendedCount.set((v) => v + 1)
        })
      }
    })

    const store = createHyperStore({
      getDispatchTime: () => Date.now()
    })

    const actionState = getMutableState(ActionState)

    dispatchAction(BaseAction({}))
    dispatchAction(ExtendedAction({}))
    dispatchAction(FurtherExtendedAction({}))
    dispatchAction(AnotherExtendedAction({}))

    applyIncomingActions()

    assert.equal(actionState.baseCount.value, 4)
    assert.equal(actionState.extendedCount.value, 2)
    assert.equal(actionState.furtherCount.value, 1)
    assert.equal(actionState.anotherExtendedCount.value, 1)
  })
})
