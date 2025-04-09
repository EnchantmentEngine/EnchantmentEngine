# Networked Component Pattern

This module provides a simplified pattern for creating components that are automatically networked using event sourcing.

## Overview

The `defineNetworkedComponent` function combines:

1. Component API (for entity querying in systems)
2. Event sourcing API (defineState & defineAction)
3. Network synchronization

This allows you to create components that are automatically synchronized across the network with minimal boilerplate.

## Usage

```typescript
import { defineNetworkedComponent } from '@ir-engine/spatial/src/network'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

// Define additional actions if needed
const itemActions = {
  updateQuantity: defineAction({
    type: 'ee.networked.ItemComponent.UPDATE_QUANTITY',
    entityUUID: matches.string,
    quantity: matches.number,
    $topic: NetworkTopics.world
  })
}

// Define custom state with receptors (recommended approach)
const itemStateDefinition = {
  receptors: {
    onUpdateQuantity: itemActions.updateQuantity.receive((action) => {
      // The state instance will be provided by defineNetworkedComponent
      return { entityUUID: action.entityUUID, quantity: action.quantity }
    })
  }
}

// Define the networked component
const {
  component: ItemComponent,  // The component definition
  state: ItemState,          // The state for event sourcing
  actions: ItemActions,      // The actions for network operations
  spawnEntity: spawnItem     // Helper function to spawn entities
} = defineNetworkedComponent({
  // Component definition
  component: {
    name: 'ItemComponent',
    jsonID: 'EE_item',

    schema: S.Object({
      itemId: S.String(''),
      name: S.String(''),
      // ... other properties
    })
  },

  // Additional actions
  actions: itemActions,

  // Custom state definition with receptors
  stateDefinition: itemStateDefinition,

  // Custom reactor for state updates (optional)
  stateReactor: ({ entityUUID }) => {
    const entity = UUIDComponent.useEntityByUUID(entityUUID)
    const itemState = useHookstate(getMutableState(ItemState)[entityUUID])

    useEffect(() => {
      if (!entity || !itemState.value) return

      // Apply state to component
      setComponent(entity, ItemComponent, {
        ...itemState.value
      })
    }, [entity, itemState.value])

    return null
  }
})

// Now we can use the actions to update the state
// The receptors we defined will handle the updates

// Spawn a new entity with the component
const { entity, entityUUID } = spawnItem({
  parentUUID: '0', // Root entity
  position: { x: 0, y: 1, z: 0 },
  itemId: 'sword-123',
  name: 'Excalibur'
})

// Update a property using an action
dispatchAction(itemActions.updateQuantity({
  entityUUID,
  quantity: 2
}))
```

## Benefits

- **Simplified API**: Define a component and get networking for free
- **Automatic Synchronization**: State changes are automatically synchronized
- **Type Safety**: Full TypeScript support
- **Spatial Integration**: Automatically works with transform components
- **Extensible**: Add custom actions and reactors as needed

## Implementation Details

The pattern:

1. Defines a component based on your schema
2. Creates a state for event sourcing with receptors built-in
3. Defines actions for network operations
4. Creates a reactor to update entities based on state changes
5. Integrates with SpawnPoseState for spatial positioning
6. Returns all necessary utilities for the user

See the `examples` directory for more detailed examples.
