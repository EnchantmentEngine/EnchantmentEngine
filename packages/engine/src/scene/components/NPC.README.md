# NPCComponent - AI-Driven Non-Player Characters

This implementation provides a complete NPC (Non-Player Character) system for IR Engine that integrates AI-driven movement and behavior using WebLLM.

## Components

### NPCComponent
The main component that defines an NPC with the following properties:
- `name`: Display name of the NPC
- `avatarURL`: URL to the avatar model (VRM file)
- `aiInitialized`: Whether the AI brain is initialized (runtime only)
- `aiState`: Current AI state/behavior (runtime only)

### NPCMovementComponent
Handles movement and behavior state:
- `targetPosition`: Current target position for movement
- `movementSpeed`: Speed of movement (default: 1.0)
- `isMoving`: Whether the NPC is currently moving
- `behaviorState`: Current behavior ('idle', 'wandering', 'returning', 'exploring')
- `nextDecisionTime`: Time until next AI decision
- `decisionInterval`: How often AI makes decisions (default: 3.0 seconds)
- `movementDirection`: Current movement direction vector
- `lookAtTarget`: Whether to look at target while moving
- `wanderRadius`: Maximum distance from spawn point (default: 10.0)
- `spawnPosition`: Original spawn position to return to

### NPCActions
Action definitions for NPC behavior:
- `setMovementTarget`: Set a new movement target
- `setBehaviorState`: Change behavior state
- `initializeAI`: Initialize the AI brain
- `aiDecision`: Process AI decision

### NPCSystem
The system that runs the AI logic and movement updates:
- Initializes WebLLM with Llama-3.2-1B-Instruct model
- Makes AI decisions based on environment context
- Updates NPC movement towards targets
- Handles fallback behavior if AI fails

## Features

### AI-Driven Behavior
- Uses @mlc-ai/web-llm for local AI processing
- Lightweight Llama-3.2-1B model for fast decisions
- Context-aware decision making based on:
  - Current position and spawn point
  - Nearby entities
  - Current behavior state
  - Environmental factors

### Avatar Integration
- Loads avatars using existing IR Engine avatar system
- Supports VRM avatar models
- Integrates with avatar movement and animation systems

### Movement System
- Smooth movement towards AI-determined targets
- Respects wander radius to keep NPCs in designated areas
- Fallback to simple random movement if AI fails
- Integration with existing avatar movement functions

## Usage

### Basic NPC Creation
```typescript
import { createEntity, setComponent } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { NPCComponent } from './NPCComponent'

const npcEntity = createEntity()
setComponent(npcEntity, TransformComponent)
setComponent(npcEntity, NPCComponent, {
  name: 'MyNPC',
  avatarURL: '/path/to/avatar.vrm'
})
```

### Custom Movement Settings
```typescript
import { NPCMovementComponent } from './NPCMovementComponent'

setComponent(npcEntity, NPCMovementComponent, {
  movementSpeed: 2.0,
  wanderRadius: 15.0,
  decisionInterval: 2.0
})
```

### System Integration
The NPCSystem must be added to your engine's system list:
```typescript
import { NPCSystem } from './systems/NPCSystem'

// Add to your system configuration
systems.push(NPCSystem)
```

## Dependencies

- `@mlc-ai/web-llm`: For AI brain functionality
- Existing IR Engine avatar system
- Existing movement and transform systems

## Performance Considerations

- WebLLM initialization happens asynchronously
- AI decisions are made at configurable intervals (default: 3 seconds)
- Fallback behavior ensures NPCs continue moving even if AI fails
- Uses lightweight 1B parameter model for fast inference

## Future Enhancements

- Support for different AI models based on NPC type
- Integration with dialogue systems
- More sophisticated behavior trees
- Pathfinding integration
- Social interactions between NPCs
- Memory system for persistent NPC knowledge

## Testing

Unit tests are provided for both components:
- `NPCComponent.test.ts`: Tests component creation and properties
- `NPCMovementComponent.test.ts`: Tests movement component functionality

Run tests with:
```bash
npm run test -- --run src/scene/components/NPCComponent.test.ts
npm run test -- --run src/scene/components/NPCMovementComponent.test.ts
```

## Example

See `NPCComponent.example.ts` for complete usage examples including:
- Basic NPC creation
- Custom movement settings
- Creating groups of NPCs
- Scene integration patterns
