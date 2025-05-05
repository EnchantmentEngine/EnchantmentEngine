/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import { defineActivity } from '../defineActivity'

/**
 * Example of defining an activity with a DSL reactor for pure logic operations
 *
 * This example demonstrates a counter activity with a reactor that:
 * 1. Maintains a local state for tracking consecutive increments
 * 2. Logs analytics events when certain thresholds are reached
 * 3. Automatically resets the counter after reaching a maximum value
 */
export const counterActivity = defineActivity({
  name: 'Counter',
  jsonID: 'ir.engine.examples.counter',

  // Define the actions for the activity
  actions: [
    {
      name: 'increment',
      jsonID: 'INCREMENT',
      schema: {
        type: 'object',
        properties: {
          amount: { type: 'number' }
        }
      }
    },
    {
      name: 'decrement',
      jsonID: 'DECREMENT',
      schema: {
        type: 'object',
        properties: {
          amount: { type: 'number' }
        }
      }
    },
    {
      name: 'reset',
      jsonID: 'RESET',
      schema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'logAnalytics',
      jsonID: 'LOG_ANALYTICS',
      schema: {
        type: 'object',
        properties: {
          event: { type: 'string' },
          value: { type: 'number' }
        }
      }
    }
  ],

  // Define the state and receptors
  state: {
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        lastAction: { type: 'string' }
      }
    },
    receptors: {
      INCREMENT: { '+': [{ var: 'state.count' }, { var: 'data.amount' }] },
      DECREMENT: { '-': [{ var: 'state.count' }, { var: 'data.amount' }] },
      RESET: 0
    }
  },

  // Define a reactor for pure logic operations (no UI)
  reactor: {
    tree: [
      // Define local state for tracking consecutive increments
      {
        type: 'hookstate',
        key: 'consecutiveIncrements',
        initial: 0
      },
      // Define local state for tracking max count reached
      {
        type: 'hookstate',
        key: 'maxReached',
        initial: false
      },
      // Effect to track consecutive increments
      {
        type: 'effect',
        deps: ['state.lastAction', 'state.count'],
        body: {
          chain: [
            // If the last action was an increment, increase the consecutive count
            {
              if: [
                { '==': [{ var: 'state.lastAction' }, 'increment'] },
                { set: [{ var: 'consecutiveIncrements' }, { '+': [{ var: 'consecutiveIncrements' }, 1] }] },
                // Otherwise reset the consecutive count
                { set: [{ var: 'consecutiveIncrements' }, 0] }
              ]
            },
            // Log analytics when reaching 5 consecutive increments
            {
              if: [
                { '==': [{ var: 'consecutiveIncrements' }, 5] },
                {
                  method: [{ var: 'console' }, 'log', ['Analytics: 5 consecutive increments reached!']]
                }
              ]
            },
            // Check if count has reached 10
            {
              if: [
                {
                  and: [{ '>=': [{ var: 'state.count' }, 10] }, { '==': [{ var: 'maxReached' }, false] }]
                },
                {
                  chain: [
                    // Set maxReached flag
                    { set: [{ var: 'maxReached' }, true] },
                    // Log analytics
                    {
                      method: [{ var: 'console' }, 'log', ['Analytics: Maximum count of 10 reached!']]
                    },
                    // Auto-reset after 2 seconds
                    {
                      method: [
                        { var: 'setTimeout' },
                        {
                          chain: [
                            {
                              method: [{ var: 'console' }, 'log', ['Auto-resetting counter...']]
                            },
                            // Reset the counter
                            {
                              method: [
                                { var: 'dispatchAction' },
                                [{ type: 'RESET', $time: { method: [{ var: 'Date' }, 'now', []] } }]
                              ]
                            },
                            // Reset the maxReached flag
                            { set: [{ var: 'maxReached' }, false] }
                          ]
                        },
                        [2000]
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    ]
  }
})
