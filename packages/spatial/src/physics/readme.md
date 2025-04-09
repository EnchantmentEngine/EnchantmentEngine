# Physics Module

The Physics Module provides a comprehensive physics simulation system using Rapier3D. It integrates with the ECS architecture and provides components and systems for rigid body dynamics, collision detection, and character controllers.

## Core Components

### RigidBodyComponent
The main physics component that provides rigid body simulation:
- Position and rotation
- Linear and angular velocity
- Mass and inertia
- Body type (Fixed, Dynamic, Kinematic)
- Collision detection
- Continuous collision detection (CCD)

### ColliderComponent
Defines the physical shape of an entity:
- Shape types (Sphere, Capsule, Cylinder, Box, Plane, ConvexHull, Mesh, Heightfield)
- Collision layers and masks
- Friction and restitution
- Trigger mode
- Mass properties

### CollisionComponent
Handles collision events and data:
- Collision detection
- Contact forces
- Collision groups
- Event handling

### TriggerComponent
Manages trigger volumes for non-physical interactions:
- Trigger detection
- Event handling
- Collision filtering

## Physics Systems

### PhysicsSystem
The main physics system that:
- Manages physics world simulation
- Handles rigid body updates
- Processes collision events
- Integrates with the simulation system group
- Supports network synchronization

### PhysicsPreTransformSystem
Handles transform updates for physics objects:
- Transform synchronization
- Rigid body pose updates
- Collider pose updates
- Dirty transform management

## Physics World Management

### Physics
The main physics API that provides:
- World creation and management
- Rigid body operations
- Collider operations
- Character controller operations
- Raycasting and shape casting
- Collision event handling

### RapierWorldState
Manages physics world state:
- World instances
- Entity-physics object mapping
- Collision event queues
- Character controllers

## Physics Types

### BodyTypes
Defines rigid body types:
- Fixed: Immovable objects
- Dynamic: Objects affected by physics
- Kinematic: Objects controlled by code

### Shapes
Defines collider shapes:
- Sphere
- Capsule
- Cylinder
- Box
- Plane
- ConvexHull
- Mesh
- Heightfield

## Physics Functions

### Physics Functions
Core physics operations:
- World management
- Rigid body operations
- Collider operations
- Character controller operations
- Raycasting
- Collision handling

### PhysicsPreTransformFunctions
Transform-related physics operations:
- Transform interpolation
- Rigid body pose updates
- Collider pose updates
- Dirty transform filtering

## Usage Examples

### Creating a Physics Object
```typescript
import { RigidBodyComponent, ColliderComponent } from '@ir-engine/spatial'

const entity = createEntity()
setComponent(entity, RigidBodyComponent, {
  type: BodyTypes.Dynamic,
  mass: 1,
  linearVelocity: { x: 0, y: 0, z: 0 },
  angularVelocity: { x: 0, y: 0, z: 0 }
})

setComponent(entity, ColliderComponent, {
  shape: Shapes.Box,
  size: { x: 1, y: 1, z: 1 },
  collisionLayer: CollisionGroups.Default,
  collisionMask: AllCollisionMask
})
```

### Creating a Character Controller
```typescript
import { Physics } from '@ir-engine/spatial'

const controller = Physics.createCharacterController(entity, {
  offset: 0.5,
  minWidth: 0.5,
  maxSlopeClimbAngle: 45,
  autostep: { maxHeight: 0.2, minWidth: 0.2 }
})
```

### Raycasting
```typescript
import { Physics } from '@ir-engine/spatial'

const hit = Physics.castRay(world, {
  origin: { x: 0, y: 0, z: 0 },
  direction: { x: 0, y: -1, z: 0 },
  maxDistance: 10,
  collisionMask: AllCollisionMask
})
```

## Best Practices

1. Use appropriate body types:
   - Fixed for static objects
   - Dynamic for physics-driven objects
   - Kinematic for script-controlled objects

2. Configure collision layers and masks:
   - Use appropriate collision groups
   - Set up collision masks for efficient filtering
   - Consider performance implications

3. Handle physics updates properly:
   - Use PhysicsPreTransformSystem for transform updates
   - Consider network synchronization
   - Handle collision events appropriately

4. Optimize physics performance:
   - Use appropriate collider shapes
   - Consider CCD for fast-moving objects
   - Use trigger volumes for non-physical interactions

5. Handle physics cleanup:
   - Remove physics components when no longer needed
   - Clean up physics worlds
   - Handle entity destruction properly 