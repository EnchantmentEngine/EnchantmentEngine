# Transform Module

The Transform Module provides a comprehensive transformation system for 3D objects, handling position, rotation, scale, and hierarchical transformations. It integrates with the ECS architecture and provides efficient matrix computations and transform updates.

## Core Components

### TransformComponent
The main transform component that provides transformation capabilities:
- Position (x, y, z)
- Rotation (quaternion)
- Scale (x, y, z)
- Local matrix
- World matrix
- Dirty state tracking

### ComputedTransformComponent
Handles computed transformations:
- Reference entity tracking
- Custom compute functions
- Dynamic transform updates

### TransformGizmoTagComponent
Marks entities as transform gizmos for editing:
- Visual transformation handles
- Interactive editing support

## Transform Systems

### TransformSystem
The main transform system that:
- Manages transform updates
- Handles matrix computations
- Processes hierarchical transforms
- Integrates with the animation system group
- Supports network synchronization

### TransformDirtyUpdateSystem
Handles dirty transform management:
- Dirty state tracking
- Transform sorting
- Reference depth updates
- Authoring layer integration

## Transform Functions

### Matrix Operations
Core matrix operations:
- `composeMatrix`: Creates local matrix from position, rotation, and scale
- `decomposeMatrix`: Extracts position, rotation, and scale from matrix
- `setFromRotationMatrix`: Sets rotation from matrix
- `computeTransformMatrix`: Updates world matrix

### Transform Utilities
Utility functions for transforms:
- World position/rotation/scale getters
- Scene-relative transforms
- Direction vectors (forward, back, up, down, right, left)
- Matrix relative to entity/scene

## Transform State Management

### TransformSerialization
Handles transform serialization:
- Network synchronization
- Position/rotation reading/writing
- Change mask tracking

### SpawnPoseState
Manages spawn pose state:
- Initial transform setup
- Spawn position/rotation
- Spawn scale

## Usage Examples

### Setting Up a Transform
```typescript
import { TransformComponent } from '@ir-engine/spatial'

const entity = createEntity()
setComponent(entity, TransformComponent, {
  position: new Vector3(0, 0, 0),
  rotation: new Quaternion(0, 0, 0, 1),
  scale: new Vector3(1, 1, 1)
})
```

### Computing World Transform
```typescript
import { computeTransformMatrix } from '@ir-engine/spatial'

computeTransformMatrix(entity)
const worldPosition = TransformComponent.getWorldPosition(entity, new Vector3())
```

### Creating a Computed Transform
```typescript
import { ComputedTransformComponent } from '@ir-engine/spatial'

setComponent(entity, ComputedTransformComponent, {
  referenceEntities: [referenceEntity],
  computeFunction: () => {
    // Custom transform computation
  }
})
```

## Best Practices

1. Use appropriate transform operations:
   - Use local transforms for self-relative changes
   - Use world transforms for global changes
   - Use scene-relative transforms for UI elements

2. Handle transform updates efficiently:
   - Mark transforms as dirty when changed
   - Use computed transforms for dynamic updates
   - Consider transform hierarchy

3. Manage transform state properly:
   - Clean up transforms when no longer needed
   - Handle network synchronization
   - Consider transform interpolation

4. Optimize transform performance:
   - Minimize unnecessary matrix computations
   - Use appropriate transform sorting
   - Consider transform caching

5. Handle transform hierarchy:
   - Consider parent-child relationships
   - Handle transform inheritance
   - Manage transform updates in hierarchy 