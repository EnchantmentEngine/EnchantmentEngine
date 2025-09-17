import { strictEqual } from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import {
  Action,
  ActionRecipients,
  applyIncomingActions,
  defineAction,
  getMutableState,
  getState,
  HyperFlux,
  NetworkTopics,
  Schema
} from '@ir-engine/hyperflux'

import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'

const TestAction = defineAction(Schema.Object({}, { $id: 'TEST_ACTION' }))

describe('IncomingActionSystem Unit Tests', async () => {
  beforeEach(() => {
    createEngine()
    // this is hacky but works and preserves the logic
    HyperFlux.store.getDispatchTime = () => {
      return getState(ECSState).simulationTime
    }
    createMockNetwork()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('applyIncomingActions', () => {
    it('should delay incoming action from the future', () => {
      // fixed tick in past
      const ecsState = getMutableState(ECSState)
      ecsState.simulationTime.set(0)

      /* mock */
      const action = TestAction({
        // incoming action from future
        $time: 2,
        $to: '0' as ActionRecipients
      }) as Required<Action>
      action.$topic = NetworkTopics.world
      // normalize meta so typing matches internal queue expectations
      action.$uuid = action.$uuid || 'test-future-uuid'
      HyperFlux.store.actions.incoming.push(action)

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(HyperFlux.store.actions.history.length, 0)

      // fixed tick update
      ecsState.simulationTime.set(2)
      applyIncomingActions()

      /* assert */
      strictEqual(HyperFlux.store.actions.history.length, 1)
    })

    it('should immediately apply incoming action from the past or present', () => {
      /* mock */
      const action = TestAction({
        // incoming action from past
        $time: -1,
        $to: '0' as ActionRecipients
      }) as Required<Action>
      action.$topic = NetworkTopics.world
      action.$uuid = action.$uuid || 'test-past-uuid'
      HyperFlux.store.actions.incoming.push(action)

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(HyperFlux.store.actions.history.length, 1)
    })
  })
})
