# JSON Description API for State Mutations

This API allows you to describe state mutations in JSON using the [json-logic-js](https://github.com/jwadhams/json-logic-js/) library. It provides a way to define pure function state transformations in JSON, which can represent any logic including conditionals and value manipulations.

## Basic Usage

The API consists of three main components:

1. `defineActivity` - A function that defines an activity with state, actions, and receptors using JSON Logic
2. `jsonLogicUtils` - Utility functions for creating common JSON Logic operations
3. `applyStateTransformation` - A function that applies a JSON Logic rule to transform state

### Defining an Activity

```typescript
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineActivity } from './defineActivity'

// Define a counter activity
const counterActivity = defineActivity({
  name: 'Counter',
  jsonID: 'test.counter',
  state: {
    schema: S.Object({
      count: S.Number(),
      message: S.String()
    }),
    receptors: {
      'test.counter.increment': {
        '+': [{ var: 'state.count' }, { var: 'data.amount' }]
      },
      'test.counter.decrement': {
        '-': [{ var: 'state.count' }, { var: 'data.amount' }]
      },
      'test.counter.reset': 0,
      'test.counter.setMessage': { var: 'data.message' }
    }
  },
  actions: [
    {
      name: 'increment',
      jsonID: 'test.counter.increment',
      schema: S.Object({
        amount: S.Number()
      })
    },
    {
      name: 'decrement',
      jsonID: 'test.counter.decrement',
      schema: S.Object({
        amount: S.Number()
      })
    },
    {
      name: 'reset',
      jsonID: 'test.counter.reset',
      schema: S.Object({})
    },
    {
      name: 'setMessage',
      jsonID: 'test.counter.setMessage',
      schema: S.Object({
        message: S.String()
      })
    }
  ]
})

// Use the activity
import { dispatchAction, getState } from '@ir-engine/hyperflux'

// Dispatch actions to update the state
dispatchAction(counterActivity.actions.increment({ amount: 5 }))
dispatchAction(counterActivity.actions.setMessage({ message: 'Hello, World!' }))

// Get the current state
const currentState = getState(counterActivity.state)
console.log(currentState.count) // 5
console.log(currentState.message) // 'Hello, World!'
```

### Using JSON Logic Utilities

The `jsonLogicUtils` module provides utility functions for creating common JSON Logic operations:

```typescript
import {
  getStateValue,
  getActionValue,
  setStateProperty,
  mergeIntoState,
  ifThenElse,
  mathOperation,
  concat,
  logicalOperation,
  comparison,
  createStateTransformation
} from './jsonLogicUtils'

// Create a rule to get a state value
const getCountRule = getStateValue('count')
// { var: 'count', in: { var: 'state' } }

// Create a rule to get an action value
const getAmountRule = getActionValue('amount')
// { var: 'amount', in: { var: 'data' } }

// Create a rule to set a state property
const setCountRule = setStateProperty('count', 10)
// { set: [{ var: 'state' }, 'count', 10] }

// Create a rule to merge into state
const mergeRule = mergeIntoState('user', { name: 'John', age: 30 })
// { merge: [{ var: 'user', in: { var: 'state' } }, { name: 'John', age: 30 }] }

// Create a conditional rule
const conditionRule = ifThenElse(
  comparison('>', getStateValue('count'), 5),
  'High count',
  'Low count'
)
// {
//   if: [
//     { '>': [{ var: 'count', in: { var: 'state' } }, 5] },
//     'High count',
//     'Low count'
//   ]
// }

// Create a math operation rule
const mathRule = mathOperation('+', getStateValue('count'), getActionValue('amount'))
// { '+': [{ var: 'count', in: { var: 'state' } }, { var: 'amount', in: { var: 'data' } }] }

// Create a string concatenation rule
const concatRule = concat('Hello, ', getStateValue('name'), '!')
// { cat: ['Hello, ', { var: 'name', in: { var: 'state' } }, '!'] }

// Create a logical operation rule
const logicRule = logicalOperation('and', 
  comparison('>', getStateValue('count'), 5),
  comparison('<', getStateValue('count'), 10)
)
// {
//   and: [
//     { '>': [{ var: 'count', in: { var: 'state' } }, 5] },
//     { '<': [{ var: 'count', in: { var: 'state' } }, 10] }
//   ]
// }

// Create a complex state transformation
const complexRule = createStateTransformation(
  setStateProperty('count', mathOperation('+', getStateValue('count'), 1)),
  setStateProperty('lastUpdated', Date.now()),
  ifThenElse(
    comparison('>', getStateValue('count'), 10),
    setStateProperty('message', 'Count is high'),
    setStateProperty('message', 'Count is low')
  )
)
```

### Applying State Transformations Directly

You can also apply JSON Logic rules directly to state:

```typescript
import { applyStateTransformation } from './defineActivity'

// Apply a simple rule to state
const state = { count: 5 }
const rule = { '+': [{ var: 'state.count' }, 1] }
const result = applyStateTransformation(state, rule)
console.log(result) // 6

// Apply a rule with action data
const action = { amount: 3 }
const ruleWithAction = { '+': [{ var: 'state.count' }, { var: 'data.amount' }] }
const resultWithAction = applyStateTransformation(state, ruleWithAction, action)
console.log(resultWithAction) // 8
```

## JSON Logic Operations

Here are some common JSON Logic operations:

### Accessing Values

- `{ var: "state.property" }` - Access a property in the state
- `{ var: "data.property" }` - Access a property in the action data

### Mathematical Operations

- `{ "+": [a, b] }` - Addition
- `{ "-": [a, b] }` - Subtraction
- `{ "*": [a, b] }` - Multiplication
- `{ "/": [a, b] }` - Division
- `{ "%": [a, b] }` - Modulo

### Comparison Operations

- `{ "==": [a, b] }` - Equality
- `{ "===": [a, b] }` - Strict equality
- `{ "!=": [a, b] }` - Inequality
- `{ "!==": [a, b] }` - Strict inequality
- `{ ">": [a, b] }` - Greater than
- `{ ">=": [a, b] }` - Greater than or equal
- `{ "<": [a, b] }` - Less than
- `{ "<=": [a, b] }` - Less than or equal

### Logical Operations

- `{ "and": [a, b, ...] }` - Logical AND
- `{ "or": [a, b, ...] }` - Logical OR
- `{ "!": a }` - Logical NOT

### Conditional Operations

- `{ "if": [condition, then, else] }` - If-then-else
- `{ "if": [condition1, value1, condition2, value2, ..., elseValue] }` - Multiple conditions

### String Operations

- `{ "cat": [a, b, ...] }` - String concatenation

### Array Operations

- `{ "map": [array, operation] }` - Map an operation over an array
- `{ "filter": [array, operation] }` - Filter an array
- `{ "reduce": [array, operation, initial] }` - Reduce an array
- `{ "all": [array, operation] }` - Check if all elements satisfy a condition
- `{ "some": [array, operation] }` - Check if some elements satisfy a condition
- `{ "none": [array, operation] }` - Check if no elements satisfy a condition

### Object Operations

- `{ "merge": [obj1, obj2, ...] }` - Merge objects
- `{ "set": [obj, key, value] }` - Set a property on an object

For more information, see the [json-logic-js documentation](https://github.com/jwadhams/json-logic-js/).
