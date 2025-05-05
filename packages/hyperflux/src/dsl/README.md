# React Hookstate DSL

A JSON-first DSL and React + Hookstate interpreter API that allows you to define React components, state, and effects using JSON.

## Usage

```jsx
import { DSLInterpreter } from '@ir-engine/hyperflux';

// Define your UI as JSON
const dsl = {
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
        className: 'container'
      },
      children: [
        {
          type: 'component',
          name: 'h1',
          children: [
            {
              type: 'component',
              name: 'text',
              props: {
                children: { var: 'counter' }
              }
            }
          ]
        },
        {
          type: 'component',
          name: 'button',
          props: {
            onClick: { 
              set: [{ var: 'counter' }, { '+': [{ var: 'counter' }, 1] }]
            }
          },
          children: [
            {
              type: 'component',
              name: 'text',
              props: {
                children: 'Increment'
              }
            }
          ]
        }
      ]
    }
  ]
};

// Render the DSL
function App() {
  return <DSLInterpreter dsl={dsl} />;
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

Defines a side effect using React's useEffect.

```json
{
  "type": "effect",
  "deps": ["counter"],
  "body": { "method": [{ "var": "console" }, "log", [{ "var": "counter" }]] },
  "cleanup": { "method": [{ "var": "console" }, "log", ["Effect cleaned up"]] }
}
```

### ComponentNode

Renders a React component or HTML element.

```json
{
  "type": "component",
  "name": "div",
  "props": {
    "className": "container"
  },
  "children": [...]
}
```

### ConditionalNode

Conditionally renders content based on an expression.

```json
{
  "type": "conditional",
  "cond": { ">": [{ "var": "counter" }, 5] },
  "then": [...],
  "else": [...]
}
```

### MapNode

Renders a list of items.

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

### DSLInterpreter

The main component that interprets a DSL tree.

```jsx
<DSLInterpreter 
  dsl={dslObject} 
  initialContext={optionalContext} 
/>
```

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
