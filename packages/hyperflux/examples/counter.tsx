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

import React from 'react'
import { DSLInterpreter } from '../src/dsl'
import { TreeRoot } from '../src/dsl/types'

// Define a counter example
const counterDSL: TreeRoot = {
  tree: [
    // Define state
    {
      type: 'hookstate',
      key: 'counter',
      initial: 0
    },
    // Render components
    {
      type: 'component',
      name: 'div',
      props: {
        style: {
          fontFamily: 'Arial, sans-serif',
          maxWidth: '400px',
          margin: '0 auto',
          padding: '20px',
          textAlign: 'center'
        }
      },
      children: [
        {
          type: 'component',
          name: 'h1',
          props: {
            style: {
              color: '#333'
            }
          },
          children: [
            {
              type: 'text',
              props: {
                children: 'Counter Example'
              }
            }
          ]
        },
        {
          type: 'component',
          name: 'div',
          props: {
            style: {
              fontSize: '24px',
              margin: '20px 0',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px'
            }
          },
          children: [
            {
              type: 'text',
              props: {
                children: { var: 'counter' }
              }
            }
          ]
        },
        {
          type: 'component',
          name: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'center',
              gap: '10px'
            }
          },
          children: [
            {
              type: 'component',
              name: 'button',
              props: {
                style: {
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                },
                onClick: {
                  chain: [{ set: [{ var: 'counter' }, { '+': [{ var: 'counter' }, 1] }] }]
                }
              },
              children: [
                {
                  type: 'text',
                  props: {
                    children: 'Increment'
                  }
                }
              ]
            },
            {
              type: 'component',
              name: 'button',
              props: {
                style: {
                  padding: '8px 16px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                },
                onClick: {
                  chain: [{ set: [{ var: 'counter' }, { '-': [{ var: 'counter' }, 1] }] }]
                }
              },
              children: [
                {
                  type: 'text',
                  props: {
                    children: 'Decrement'
                  }
                }
              ]
            },
            {
              type: 'component',
              name: 'button',
              props: {
                style: {
                  padding: '8px 16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                },
                onClick: {
                  chain: [{ set: [{ var: 'counter' }, 0] }]
                }
              },
              children: [
                {
                  type: 'text',
                  props: {
                    children: 'Reset'
                  }
                }
              ]
            }
          ]
        },
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 10] },
          then: [
            {
              type: 'component',
              name: 'div',
              props: {
                style: {
                  marginTop: '20px',
                  padding: '10px',
                  backgroundColor: '#FFC107',
                  borderRadius: '4px',
                  color: '#333'
                }
              },
              children: [
                {
                  type: 'text',
                  props: {
                    children: 'Counter is greater than 10!'
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    // Add an effect
    {
      type: 'effect',
      deps: ['counter'],
      body: {
        method: [{ var: 'console' }, 'log', ['Counter changed to:', { var: 'counter' }]]
      }
    }
  ]
}

// Example component
export function CounterExample() {
  return <DSLInterpreter dsl={counterDSL} />
}

// Usage:
// import { CounterExample } from './examples/counter';
//
// function App() {
//   return <CounterExample />;
// }
