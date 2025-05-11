# Reactive Logic DSL

A JSON-first DSL for defining reactive logic expressions in a detached React environment. This DSL is designed for expressing reversible operations in response to data changes, without rendering to the DOM.

## Purpose

The Reactive Logic DSL provides a way to:
- Define state and state transformations using Hookstate
- Create reactive effects that respond to state changes
- Express conditional logic based on state values
- Process collections of data with map operations

This DSL is specifically designed for use in detached React contexts where DOM rendering is not the goal. Instead, it focuses on the reactive data flow aspects of React, making it ideal for:
- Event sourcing systems
- State management in headless applications
- Defining reversible operations
- Creating pure state manipulations with no side effects

## Usage

```jsx
import { evaluateExpression, validateDSL } from '@ir-engine/hyperflux';

// Define your reactive logic as JSON
const dsl = {
  tree: [
    // Define state
    {
      type: 'hookstate',
      key: 'counter',
      initial: 0
    },
    // Define an effect that reacts to counter changes
    {
      type: 'effect',
      deps: ['counter'],
      body: {
        set: [{ var: 'processedValue' }, { '+': [{ var: 'counter' }, 10] }]
      }
    },
    // Define conditional logic
    {
      type: 'conditional',
      cond: { '>': [{ var: 'counter' }, 5] },
      then: [
        {
          type: 'hookstate',
          key: 'thresholdReached',
          scope: 'global',
          initial: true
        }
      ],
      else: [
        {
          type: 'hookstate',
          key: 'thresholdReached',
          scope: 'global',
          initial: false
        }
      ]
    }
  ]
};

// Validate the DSL
const errors = validateDSL(dsl);
if (errors.length === 0) {
  // Use the DSL in your reactive system
  // ...
}
```

## Node Types

### HookStateNode

Defines a state variable using Hookstate.

```json
{
  "type": "hookstate",
  "key": "counter",
  "scope": "global",
  "initial": 0
}
```

### EffectNode

Defines a side effect that reacts to state changes.

```json
{
  "type": "effect",
  "deps": ["counter"],
  "body": { "method": [{ "var": "console" }, "log", [{ "var": "counter" }]] },
  "cleanup": { "method": [{ "var": "console" }, "log", ["Effect cleaned up"]] }
}
```

### ConditionalNode

Conditionally executes logic based on an expression.

```json
{
  "type": "conditional",
  "cond": { ">": [{ "var": "counter" }, 5] },
  "then": [...],
  "else": [...]
}
```

### MapNode

Processes a list of items.

```json
{
  "type": "map",
  "items": { "var": "items" },
  "itemName": "item",
  "body": [...]
}
```

## JSON Logic

This library uses [json-logic-js](https://github.com/jwadhams/json-logic-js) for expression evaluation. It supports all standard JSON Logic operations plus some custom ones:

- `merge`: Merges objects together
- `set`: Sets a property on an object
- `chain`: Chains multiple operations together

## API Reference

### validateDSL

Validates a DSL tree against the schema.

```js
import { validateDSL } from '@ir-engine/hyperflux';

const errors = validateDSL(dslObject);
if (errors.length > 0) {
  console.error('Invalid DSL:', errors);
}
```

### evaluateExpression

Evaluates a JSON Logic expression with a given context.

```js
import { evaluateExpression } from '@ir-engine/hyperflux';

const result = evaluateExpression(
  { '+': [{ var: 'x' }, { var: 'y' }] },
  { x: 5, y: 10 }
);
// result = 15
```

## Event Sourcing Integration

The Reactive Logic DSL is particularly well-suited for event sourcing systems:

- Use `HookStateNode` to define the state that will be manipulated
- Create pure state transformations with no side effects in state receptors
- Use `EffectNode` to define reactors that handle side effects separately
- Express complex conditional logic with `ConditionalNode`
- Process collections with `MapNode`

This separation ensures that state manipulation remains pure and reversible, while side effects are properly isolated in reactors.
