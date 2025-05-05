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

// Define a todo list example
const todoDSL: TreeRoot = {
  tree: [
    // Define state for todos
    {
      type: 'hookstate',
      key: 'todos',
      initial: [
        { id: 1, text: 'Learn React', completed: true },
        { id: 2, text: 'Learn Hookstate', completed: false },
        { id: 3, text: 'Build something awesome', completed: false }
      ]
    },
    // Define state for new todo input
    {
      type: 'hookstate',
      key: 'newTodo',
      initial: ''
    },
    // Define state for next ID
    {
      type: 'hookstate',
      key: 'nextId',
      initial: 4
    },
    // Render components
    {
      type: 'component',
      name: 'div',
      props: {
        style: {
          fontFamily: 'Arial, sans-serif',
          maxWidth: '500px',
          margin: '0 auto',
          padding: '20px'
        }
      },
      children: [
        {
          type: 'component',
          name: 'h1',
          props: {
            style: {
              color: '#333',
              textAlign: 'center'
            }
          },
          children: [
            {
              type: 'text',
              props: {
                children: 'Todo List'
              }
            }
          ]
        },
        // Form for adding new todos
        {
          type: 'component',
          name: 'form',
          props: {
            style: {
              display: 'flex',
              marginBottom: '20px'
            },
            onSubmit: {
              chain: [
                // Prevent default form submission
                { method: [{ var: 'event' }, 'preventDefault'] },
                // Add new todo if not empty
                {
                  if: [
                    { '!==': [{ var: 'newTodo' }, ''] },
                    {
                      chain: [
                        // Add new todo
                        {
                          set: [
                            { var: 'todos' },
                            {
                              concat: [
                                { var: 'todos' },
                                [
                                  {
                                    merge: [
                                      { id: { var: 'nextId' } },
                                      { text: { var: 'newTodo' } },
                                      { completed: false }
                                    ]
                                  }
                                ]
                              ]
                            }
                          ]
                        },
                        // Increment next ID
                        { set: [{ var: 'nextId' }, { '+': [{ var: 'nextId' }, 1] }] },
                        // Clear input
                        { set: [{ var: 'newTodo' }, ''] }
                      ]
                    }
                  ]
                }
              ]
            }
          },
          children: [
            {
              type: 'component',
              name: 'input',
              props: {
                type: 'text',
                value: { var: 'newTodo' },
                onChange: {
                  chain: [{ set: [{ var: 'newTodo' }, { var: 'event.target.value' }] }]
                },
                placeholder: 'Add a new todo',
                style: {
                  flex: '1',
                  padding: '8px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px 0 0 4px'
                }
              }
            },
            {
              type: 'component',
              name: 'button',
              props: {
                type: 'submit',
                style: {
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0 4px 4px 0',
                  cursor: 'pointer',
                  fontSize: '16px'
                }
              },
              children: [
                {
                  type: 'text',
                  props: {
                    children: 'Add'
                  }
                }
              ]
            }
          ]
        },
        // Todo list
        {
          type: 'component',
          name: 'ul',
          props: {
            style: {
              listStyleType: 'none',
              padding: '0'
            }
          },
          children: [
            {
              type: 'map',
              items: { var: 'todos' },
              itemName: 'todo',
              body: [
                {
                  type: 'component',
                  name: 'li',
                  props: {
                    key: { var: 'todo.id' },
                    style: {
                      padding: '12px',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }
                  },
                  children: [
                    {
                      type: 'component',
                      name: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center'
                        }
                      },
                      children: [
                        {
                          type: 'component',
                          name: 'input',
                          props: {
                            type: 'checkbox',
                            checked: { var: 'todo.completed' },
                            onChange: {
                              chain: [
                                {
                                  set: [
                                    { var: 'todos' },
                                    {
                                      map: [
                                        { var: 'todos' },
                                        {
                                          if: [
                                            { '===': [{ var: 'item.id' }, { var: 'todo.id' }] },
                                            {
                                              merge: [
                                                { var: 'item' },
                                                { completed: { '!': [{ var: 'item.completed' }] } }
                                              ]
                                            },
                                            { var: 'item' }
                                          ]
                                        }
                                      ]
                                    }
                                  ]
                                }
                              ]
                            },
                            style: {
                              marginRight: '10px'
                            }
                          }
                        },
                        {
                          type: 'component',
                          name: 'span',
                          props: {
                            style: {
                              textDecoration: {
                                if: [{ var: 'todo.completed' }, 'line-through', 'none']
                              },
                              color: {
                                if: [{ var: 'todo.completed' }, '#999', '#333']
                              }
                            }
                          },
                          children: [
                            {
                              type: 'text',
                              props: {
                                children: { var: 'todo.text' }
                              }
                            }
                          ]
                        }
                      ]
                    },
                    {
                      type: 'component',
                      name: 'button',
                      props: {
                        onClick: {
                          chain: [
                            {
                              set: [
                                { var: 'todos' },
                                {
                                  filter: [{ var: 'todos' }, { '!==': [{ var: 'item.id' }, { var: 'todo.id' }] }]
                                }
                              ]
                            }
                          ]
                        },
                        style: {
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px 10px',
                          cursor: 'pointer'
                        }
                      },
                      children: [
                        {
                          type: 'text',
                          props: {
                            children: 'Delete'
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        // Summary
        {
          type: 'component',
          name: 'div',
          props: {
            style: {
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              textAlign: 'center'
            }
          },
          children: [
            {
              type: 'text',
              props: {
                children: {
                  cat: [
                    'Completed: ',
                    {
                      reduce: [
                        { var: 'todos' },
                        { '+': [{ var: 'accumulator' }, { if: [{ var: 'current.completed' }, 1, 0] }] },
                        0
                      ]
                    },
                    ' / ',
                    { length: [{ var: 'todos' }] }
                  ]
                }
              }
            }
          ]
        }
      ]
    }
  ]
}

// Example component
export function TodoListExample() {
  return <DSLInterpreter dsl={todoDSL} />
}

// Usage:
// import { TodoListExample } from './examples/todo-list';
//
// function App() {
//   return <TodoListExample />;
// }
