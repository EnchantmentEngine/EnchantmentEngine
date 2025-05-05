# Reactive JSON DSL: React + Hookstate API Specification

## Purpose

This document defines a JSON-first DSL and the corresponding React + Hookstate interpreter API. It provides the schema definitions, node semantics, and implementation guidelines needed for a coding assistant to build:

- A runtime that interprets a JSON tree into React components.
- Hookstate integration for stateful logic (`useHookstate`).
- Effects (`useEffect`).
- Component rendering with conditional and list-mapping support.
- Expression evaluation via JSON Logic.

---

## 1. Node Tree Structure

The root payload is an object with:

```json
{
  "tree": [
    /* Node objects in render order */
  ]
}
```

- **tree** (`array` of `Node`): Top-level list of nodes. Render order and hook order are determined by this array.

---

## 2. Node Definitions

Each node in `tree` must conform to one of the following types:

### 2.1 HookStateNode

```json
{
  "type": "hookstate",
  "key": "string",            // unique identifier for store or local var
  "scope": "global|local",    // default: "global"
  "initial": Expression       // optional initial value expression
}
```

- **key**: namespace/path for the Hookstate store.
- **scope**: `"global"` for shared stores, `"local"` for per-component-local variables.
- **initial**: a JSON Logic or literal expression used to initialize the state.

### 2.2 EffectNode

```json
{
  "type": "effect",
  "deps": [ "string", ... ],   // list of dependency keys (hookstate keys or expressions)
  "body": Expression,          // JSON Logic or literal for effect
  "cleanup": Expression        // optional cleanup expression
}
```

- **deps**: array of expressions or key references tracked by `useEffect`.
- **body**: expression for effect body; called when dependencies change.
- **cleanup**: expression for cleanup; returned by effect.

### 2.3 ComponentNode

```json
{
  "type": "component",
  "name": "string",            // React component or HTML tag name
  "props": {
    "propName": Expression,    // prop values (expressions or literals)
    ...
  },
  "children": [ Node, ... ]    // nested node array
}
```

- **name**: tag or custom component identifier.
- **props**: map of prop names to expression values.
- **children**: zero or more child nodes.

### 2.4 ConditionalNode

```json
{
  "type": "conditional",
  "cond": Expression,         // condition expression
  "then": [ Node, ... ],      // nodes if cond is truthy
  "else": [ Node, ... ]       // optional nodes if cond is falsy
}
```

- **cond**: evaluated expression.
- **then**: rendered when `cond` is truthy.
- **else**: rendered when `cond` is falsy (can be omitted).

### 2.5 MapNode

```json
{
  "type": "map",
  "items": Expression,         // expression resolving to an array
  "itemName": "string",        // name of the iteration variable
  "body": [ Node, ... ]        // template nodes for each item
}
```

- **items**: expression yielding an array to iterate.
- **itemName**: local variable name bound to each array element.
- **body**: node subtree instantiated per item.

---

## 3. Expression Definition

```json
"Expression": {
  "description": "JSON Logic or literal",
  "oneOf": [
    { "type": "number" },
    { "type": "string" },
    { "type": "boolean" },
    { "type": "array", "items": { "$ref": "#/definitions/Expression" } },
    { "type": "object" }
  ]
}
```

- Use JSON Logic syntax (`{ "if": [...], "+": [...], "var": [...] }`) to express arithmetic, conditions, state reads/writes, and API calls.
- Literals (numbers, strings, booleans) stand alone.

---

## 4. Runtime Interpretation

1. **Hook Ordering**  
   - Traverse `tree` sequentially.
   - For each `hookstate` or `effect` node, call React hooks in the same order.

2. **State Reads/Writes**  
   - `useHookstate(key, initial?)` returns a Signal object.
   - Surround interpreter in a React component and call hooks directly.

3. **Effects**  
   - `useEffect(() => { evaluate(body); return () => evaluate(cleanup); }, depsArray);`
   - Resolve `depsArray` by evaluating each dependency expression.

4. **Rendering Components**  
   - For `ComponentNode`, call `React.createElement(name, props, ...children)`.
   - Resolve `props` by evaluating each Expression.
   - Recursively render `children`.

5. **Conditionals & Maps**  
   - For `conditional`, evaluate `cond`. Render `then` or `else` subtree.
   - For `map`, evaluate `items` to an array. For each element:
     - Bind element to `itemName` as a local context variable.
     - Render `body` subtree.

6. **Expression Evaluation**  
   - Use a JSON Logic engine to evaluate all `Expression` nodes.
   - Provide context:  
     ```js
     const context = {
       // map of hookstate keys to signal values,
       // special `$` functions for API calls (e.g. fetch),
       // local variables (e.g. map itemName)
     };
     ```

---

## 5. Implementation Notes

- **Schema Validation**: Validate the incoming JSON against the schema before rendering.
- **Error Handling**: On schema errors or evaluation exceptions, render a fallback UI or error component.
- **Caching**: Cache compiled JSON Logic functions if parsing overhead is significant.
- **Tooling**: Provide editor autocomplete for `type` values and `Expression` templates.
