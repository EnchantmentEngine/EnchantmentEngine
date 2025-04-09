# Input Module

The Input Module provides a comprehensive input handling system that supports multiple input sources including mouse, keyboard, touch, and XR controllers. It integrates with the ECS architecture and provides a unified way to handle input across different platforms and devices.

## Core Components

### InputComponent
The main input component that provides input handling capabilities:
- Input sink management
- Activation distance for proximity-based input
- Highlight and grow effects
- Input source tracking
- Input execution hooks

### InputSourceComponent
Represents a physical input source (mouse, keyboard, XR controller):
- Source device information
- Button state tracking
- Raycasting capabilities
- Intersection detection
- XR-specific features

### InputSinkComponent
Receives input from input entities:
- Input entity tracking
- Input source aggregation

### InputPointerComponent
Handles pointer input (mouse, touch, XR ray):
- Pointer position tracking
- Movement detection
- Camera association
- Pointer state management

## Input Systems

### ClientInputSystem
The main input system that:
- Manages input source lifecycle
- Handles input state updates
- Processes input events
- Manages input capture
- Integrates with the input system group

### FlyControlSystem
Provides flight-style camera controls:
- Movement based on input
- Rotation control
- Camera orbit integration
- Input mapping

## Input State Management

### InputState
Global input state management:
- Preferred hand tracking
- Pointer raycaster
- Scroll state
- Input capture management
- Input mesh tracking
- Bounding box tracking

### InputPointerState
Manages pointer state:
- Pointer tracking
- Camera association
- Pointer hash management

## Input Functions

### ClientInputFunctions
Utility functions for input handling:
- Input source management
- Raycasting
- Intersection detection
- Proximity detection

### ClientInputHooks
React hooks for input handling:
- Input source hooks
- Pointer management
- Input state tracking

## Input Heuristics

The module provides sophisticated input heuristics for:
- Raycasting-based input detection
- Proximity-based input detection
- Bounding box intersection
- Mesh intersection

## Usage Examples

### Setting Up Input for an Entity
```typescript
import { InputComponent } from '@ir-engine/spatial'

const entity = createEntity()
setComponent(entity, InputComponent, {
  inputSinks: ['Self'],
  activationDistance: 2,
  highlight: true
})
```

### Handling Input Events
```typescript
import { InputComponent } from '@ir-engine/spatial'

InputComponent.useExecuteWithInput(
  () => {
    // Handle input
    console.log('Input received!')
  },
  false, // executeWhenEditing
  InputExecutionOrder.With
)
```

### Creating an Input Source
```typescript
import { InputSourceComponent } from '@ir-engine/spatial'

setComponent(entity, InputSourceComponent, {
  source: xrInputSource,
  buttons: createInitialButtonState()
})
```

## Best Practices

1. Use appropriate input components based on the type of interaction:
   - `InputComponent` for general input handling
   - `InputSourceComponent` for device-specific input
   - `InputPointerComponent` for pointer-based input

2. Consider input capture when implementing complex interactions:
   - Use `InputState.setCapturingEntity` to manage input focus
   - Release input capture when interaction is complete

3. Implement appropriate input heuristics:
   - Use raycasting for precise input
   - Use proximity detection for spatial input
   - Consider both mesh and bounding box intersections

4. Handle input state cleanup:
   - Remove input components when no longer needed
   - Clean up input sources and pointers
   - Release input capture when appropriate

5. Consider platform-specific input handling:
   - Support both desktop and mobile input
   - Handle XR input appropriately
   - Consider different input mappings for different devices 