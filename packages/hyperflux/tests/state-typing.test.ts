import { describe, it } from 'vitest'
import { defineAction, defineState, matches, matchesWithDefault } from '..'

describe('State Typing Tests', () => {
  it('should correctly type the state parameter in action receptors', () => {
    // Define an action
    const testAction = defineAction({
      type: 'TEST_ACTION',
      payload: matchesWithDefault(matches.string, () => 'default')
    })

    // Define a state with a specific shape
    type TestStateType = {
      count: number
      message: string
    }

    const TestState = defineState({
      name: 'test.TestState',
      initial: {
        count: 0,
        message: 'hello'
      } as TestStateType,

      receptors: {
        // This should work fine - accessing valid properties
        onTestValid: testAction.receive<TestStateType>((action, state) => {
          // These should be valid operations
          state.count.set(state.count.value + 1)
          state.message.set(action.payload)
        }),

        // This should cause a type error - accessing invalid property
        onTestInvalid: testAction.receive<TestStateType>((action, state) => {
          // @ts-expect-error - This should cause a type error because 'nonExistentProperty' doesn't exist on the state
          state.nonExistentProperty.set('test')
        })
      }
    })

    // Test with explicit type annotation
    const explicitTest = testAction.receive<TestStateType>((action, state) => {
      // This should work
      state.count.set(state.count.value + 1)

      // @ts-expect-error - This should cause a type error
      state.invalidProperty.set('test')
    })
  })
})
