# Proposed JSON‑Schema-based API for `defineEventSource`

This document proposes replacing imperative `validate(event, state)` and `receive(event, state)` functions with fully serializable JSON Schemas and a small declarative transform vocabulary. The goal is to make event specifications portable, analyzable, and executable across server/clients and tests, while still supporting complex querying, conditionals, and transformations.

## Current pattern (summary)

- Event payload schemas exist today (e.g., `Schema.Object({...})`).
- `validate` and `receive` are functions that:
  - Check preconditions using runtime logic.
  - Mutate state maps (e.g., bidirectional mappings between `(mount -> entity)` and `(entity -> mount)`).
- Example semantics in `MountPointsState`:
  - `mountInteraction`: If `mounted` is true, set both directions; otherwise clear them.
  - `destroyObject`: If a destroyed entity is mounted, clear both directions.

## Proposed API shape

The key changes:

- `validate`: JSON Schema evaluated against a validation context `{ event, state }`.
- `transform`: A declarative plan describing state mutations as JSON data, applied atomically if `validate` passes.

```ts
// Conceptual shape (illustrative)
defineEventSource({
  name: string,
  initial: State,
  events: {
    [eventName: string]: {
      schema: JsonSchema,           // payload schema (unchanged)
      validate: JsonSchema,         // schema over { event, state }
      transform: TransformPlan      // declarative ops
    }
  }
})
```

### Validation context and vocabulary

- Context object: `{ event: <payload>, state: <currentState> }`.
- Use JSON Schema 2020-12 for logical composition (`if/then/else`, `allOf`, `anyOf`, etc.).
- Minimal custom vocabulary (example URI: `https://ir.engine/vocab/transform`):
  - `$ir/get`: Resolve a JSON Pointer/JSONPath against `event` or `state`.
  - `$ir/exists`: Boolean check that a dynamic path exists and is not null.
  - `$ir/equals`: Compare dynamic values.
  - Template paths: JSON Pointers may contain tokens like `{event.foo}` or `{vars.bar}`.

### Transform plan vocabulary

Represent `receive` as a declarative plan with atomic, composable operations.

- `variables` (optional): Named lookups you can reuse.
- `preconditions` (optional): JSON Schemas over `{ event, state, vars }` that must hold before applying ops.
- `when`: Array of conditional branches with `if/then/else` schemas.
- `ops`: JSON Patch-like operations with dynamic path interpolation.
- `atomic`: Apply all ops in a single transaction or fail.

Example op structure:

```json
{
  "op": "set" | "remove" | "replace" | "add" | "test",
  "path": "/mountsToMountedEntities/{event.targetMount}",
  "value": { "valueFrom": "event.mountedEntity" }
}
```

Notes:
- Prefer `remove` to represent absence instead of sentinel values.
- `test` ops and `preconditions` enable optimistic concurrency and safe updates.

## Example: `mountInteraction`

- Intent:
  - If `mounted === true`: ensure both sides are free, then set both mappings.
  - Else: ensure mapping matches, then remove both sides.

Validation (illustrative):

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "allOf": [
    {
      "if": { "properties": { "event": { "properties": { "mounted": { "const": true } } } } },
      "then": {
        "allOf": [
          { "$ir/exists": { "not": true, "path": "/state/mountsToMountedEntities/{event.targetMount}" } },
          { "$ir/exists": { "not": true, "path": "/state/mountedEntitiesToMounts/{event.mountedEntity}" } }
        ]
      }
    },
    {
      "if": { "properties": { "event": { "properties": { "mounted": { "const": false } } } } },
      "then": {
        "allOf": [
          { "$ir/equals": { "left": { "path": "/state/mountsToMountedEntities/{event.targetMount}" }, "right": { "valueFrom": "event.mountedEntity" } } },
          { "$ir/equals": { "left": { "path": "/state/mountedEntitiesToMounts/{event.mountedEntity}" }, "right": { "valueFrom": "event.targetMount" } } }
        ]
      }
    }
  ]
}
```

Transform (illustrative):

```json
{
  "atomic": true,
  "when": [
    {
      "if": { "properties": { "event": { "properties": { "mounted": { "const": true } } } } },
      "then": {
        "ops": [
          { "op": "set", "path": "/mountsToMountedEntities/{event.targetMount}", "value": { "valueFrom": "event.mountedEntity" } },
          { "op": "set", "path": "/mountedEntitiesToMounts/{event.mountedEntity}", "value": { "valueFrom": "event.targetMount" } }
        ]
      }
    },
    {
      "if": { "properties": { "event": { "properties": { "mounted": { "const": false } } } } },
      "then": {
        "ops": [
          { "op": "remove", "path": "/mountsToMountedEntities/{event.targetMount}" },
          { "op": "remove", "path": "/mountedEntitiesToMounts/{event.mountedEntity}" }
        ]
      }
    }
  ]
}
```

## Example: `destroyObject`

- Intent:
  - If the destroyed entity is mounted, remove both sides of the mapping.

Transform (illustrative):

```json
{
  "atomic": true,
  "variables": {
    "mountUUID": { "get": "/mountedEntitiesToMounts/{event.entityUUID}" }
  },
  "when": [
    {
      "if": { "$ir/exists": { "path": "/state/mountedEntitiesToMounts/{event.entityUUID}" } },
      "then": {
        "ops": [
          { "op": "remove", "path": "/mountsToMountedEntities/{vars.mountUUID}" },
          { "op": "remove", "path": "/mountedEntitiesToMounts/{event.entityUUID}" }
        ]
      }
    }
  ]
}
```

## Why this design

- Serializable: Everything is data, enabling static analysis and code generation.
- Composable: Payload schema, validation, and transform travel together.
- Safe: Preconditions and atomic ops reduce race conditions and partial updates.
- Portable: Execute the same plans on server, client, and test environments.

## Implementation notes

- Adopt JSON Schema 2020‑12 and register a custom vocabulary for `$ir/*` keywords.
- Back the transform runtime with JSON Patch semantics, extended with dynamic path templates and variable substitution.
- Prefer removals to sentinel `none` values for absence.
- Provide a small runtime to:
  - Evaluate `validate` against `{ event, state }`.
  - Expand `variables` and branch `when` conditionals.
  - Apply `ops` atomically, with clear error reporting.