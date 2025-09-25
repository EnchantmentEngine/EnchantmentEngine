import { applyIncomingActions, dispatchAction, getState } from '@ir-engine/hyperflux'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { TransformPlan } from '@hexafield/json-transform-patch'
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { defineEventSourceFromJSON } from './defineEventSourceFromJSON'

describe('defineEventSourceFromJSON', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('validates and applies a transform plan to state', () => {
    const def = {
      name: 'TestSource',
      initial: { index: { byGroup: {}, byItem: {} } },
      events: {
        toggleMembership: {
          schema: {
            $id: 'ee.spatial.test.toggleMembership',
            type: 'object',
            properties: {
              add: { type: 'boolean' },
              groupId: { type: 'string' },
              itemId: { type: 'string' }
            }
          },
          // Validate with a simple precondition on the event shape
          validate: {
            atomic: true,
            preconditions: {
              properties: {
                event: {
                  type: 'object',
                  required: ['add', 'groupId', 'itemId'],
                  properties: {
                    add: { type: 'boolean' },
                    groupId: { type: 'string' },
                    itemId: { type: 'string' }
                  }
                }
              }
            },
            when: [
              {
                if: {},
                then: { ops: [] }
              }
            ]
          } as TransformPlan,
          // Apply the example toggling plan from the spec/readme
          transform: {
            atomic: true,
            when: [
              {
                if: { properties: { event: { properties: { add: { const: true } } } } },
                then: {
                  ops: [
                    {
                      op: 'set',
                      path: '/index/byGroup/{event.groupId}',
                      value: { valueFrom: 'event.itemId' }
                    },
                    {
                      op: 'set',
                      path: '/index/byItem/{event.itemId}',
                      value: { valueFrom: 'event.groupId' }
                    }
                  ]
                }
              },
              {
                if: { properties: { event: { properties: { add: { const: false } } } } },
                then: {
                  ops: [
                    { op: 'remove', path: '/index/byGroup/{event.groupId}' },
                    { op: 'remove', path: '/index/byItem/{event.itemId}' }
                  ]
                }
              }
            ]
          } as TransformPlan
        }
      }
    } as const

    const { actions, state } = defineEventSourceFromJSON(def)

    // Dispatch an action that should add the mapping
    dispatchAction(actions.toggleMembership({ add: true, groupId: 'G1', itemId: 'I1' }))
    applyIncomingActions()

    const current = getState(state)
    expect(current.index.byGroup['G1']).toBe('I1')
    expect(current.index.byItem['I1']).toBe('G1')
  })
})
