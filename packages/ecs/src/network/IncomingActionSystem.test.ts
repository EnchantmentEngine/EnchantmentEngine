import assert, { strictEqual } from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { createEngine, destroyEngine, Engine } from '@ir-engine/ecs/src/Engine'
import {
  ActionRecipients,
  applyIncomingActions,
  defineAction,
  getMutableState,
  getState,
  NetworkTopics
} from '@ir-engine/hyperflux'

import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'

const TestAction = defineAction({ type: 'test', schema: { type: 'object', properties: {} } })

describe('IncomingActionSystem Unit Tests', async () => {
  beforeEach(() => {
    createEngine()
    // this is hacky but works and preserves the logic
    Engine.instance.store.getDispatchTime = () => {
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
      })
      action.$topic = NetworkTopics.world
      // normalize meta so typing matches internal queue expectations
      action.$uuid = action.$uuid || 'test-future-uuid'
      Engine.instance.store.actions.incoming.push(action as any)

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(Engine.instance.store.actions.history.length, 0)

      // fixed tick update
      ecsState.simulationTime.set(2)
      applyIncomingActions()

      /* assert */
      strictEqual(Engine.instance.store.actions.history.length, 1)
    })

    it('should immediately apply incoming action from the past or present', () => {
      /* mock */
      const action = TestAction({
        // incoming action from past
        $time: -1,
        $to: '0' as ActionRecipients
      })
      action.$topic = NetworkTopics.world
      action.$uuid = action.$uuid || 'test-past-uuid'
      Engine.instance.store.actions.incoming.push(action as any)

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(Engine.instance.store.actions.history.length, 1)
    })
  })

  describe('applyAndArchiveIncomingAction', () => {
    it('should cache actions where $cache = true', () => {
      /* mock */
      const action = TestAction({
        // incoming action from past
        $time: 0,
        $to: '0' as ActionRecipients,
        $cache: true
      })
      action.$topic = NetworkTopics.world
      action.$uuid = action.$uuid || 'test-cache-uuid'
      Engine.instance.store.actions.incoming.push(action as any)

      /* run */
      applyIncomingActions()

      /* assert */
      strictEqual(Engine.instance.store.actions.history.length, 1)
      assert(Engine.instance.store.actions.cached.indexOf(action as any) !== -1)
    })
  })
})
