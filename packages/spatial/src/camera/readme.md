# Camera Module

The Camera Module provides a comprehensive camera system for 3D scenes, supporting various camera modes, behaviors, and effects. It integrates with the ECS architecture and provides both basic camera functionality and advanced features like camera following, orbiting, and asset preview.

## Core Components

### CameraComponent
The base camera component that provides essential camera properties and functionality:
- Field of view (FOV)
- Aspect ratio
- Near and far clipping planes
- Perspective camera setup

### FollowCameraComponent
Enables camera following behavior with multiple modes:
- First Person
- Shoulder Cam
- Third Person
- Top Down
- Strategic
- Dynamic

Features:
- Smooth interpolation between positions
- Configurable distance and offset
- Raycasting for collision avoidance
- Shoulder side switching
- Pointer lock support

### CameraOrbitComponent
Provides orbital camera controls:
- Focus on specific entities
- Panning and orbiting
- Zoom controls
- Minimum zoom distance
- Disable/enable functionality

### TargetCameraRotationComponent
Handles smooth camera rotation transitions:
- Phi (vertical) and theta (horizontal) angles
- Velocity-based interpolation
- Configurable transition time

### AssetPreviewCameraComponent
Specialized component for asset preview:
- Automatic focus on target model
- Child mesh detection
- Integration with orbit controls

## Camera Systems

### CameraSystem
The main camera system that:
- Manages camera entity lifecycle
- Handles camera settings updates
- Integrates with the animation system group
- Supports network synchronization

### CameraOrbitSystem
Manages orbital camera behavior:
- Entity focusing
- Panning and orbiting controls
- Zoom functionality

### CameraFadeBlackEffectSystem
Handles fade-to-black effects for transitions

### FollowCameraInputSystem
Processes input for follow camera behavior

## Camera Functions

### Camera Functions
Utility functions for camera operations:
- `setTargetCameraRotation`: Smoothly transitions camera rotation
- `computeCameraDistanceAndCenterFromBox`: Calculates optimal camera position to frame objects
- `setCameraFocusOnBox`: Focuses camera on a bounding box
- `inFrustum`: Checks if an entity is within the camera's view frustum

## Camera State Management

### CameraSettings
Global camera settings:
- Camera rotation speed
- FOV
- Clipping planes
- Projection type
- Distance limits
- Camera mode defaults

### CameraActions
Defines camera-related actions:
- `spawnCamera`: Creates a new camera entity
- `fadeToBlack`: Triggers fade-to-black effect

## Usage Examples

### Creating a Basic Camera
```typescript
import { CameraComponent } from '@ir-engine/spatial'

const entity = createEntity()
setComponent(entity, CameraComponent, {
  fov: 60,
  aspect: 1,
  near: 0.1,
  far: 1000
})
```

### Setting Up a Follow Camera
```typescript
import { FollowCameraComponent } from '@ir-engine/spatial'

setComponent(entity, FollowCameraComponent, {
  targetEntity: target,
  mode: FollowCameraMode.ThirdPerson,
  distance: 5,
  minPhi: -70,
  maxPhi: 85
})
```

### Creating an Orbital Camera
```typescript
import { CameraOrbitComponent } from '@ir-engine/spatial'

setComponent(entity, CameraOrbitComponent, {
  focusedEntities: [targetEntity],
  minimumZoom: 0.1
})
```

## Best Practices

1. Use appropriate camera modes for different scenarios:
   - First Person for immersive experiences
   - Third Person for character following
   - Top Down for strategy games
   - Dynamic for flexible camera behavior

2. Configure appropriate distance limits and smoothness values for smooth camera movement

3. Use raycasting for collision avoidance in follow camera modes

4. Consider performance implications of camera systems and optimize accordingly 