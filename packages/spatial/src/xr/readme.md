# XR Module

The XR Module provides a comprehensive Extended Reality (XR) system that supports both WebXR and 8th Wall platforms. It handles VR/AR session management, camera systems, hand tracking, spatial anchors, and environment understanding features.

## Core Components

### XR Components
Base components for XR functionality:
- `XRLeftHandComponent`: Hand tracking for left hand
- `XRRightHandComponent`: Hand tracking for right hand
- `XRInputSourceComponent`: Input source management
- `XRAnchorComponent`: Spatial anchor management
- `XRDetectedMeshComponent`: Environment mesh detection

## XR Systems

### XRSystem
The main XR system that:
- Manages XR session lifecycle
- Handles session mode support detection
- Manages input source tracking
- Integrates with the input system group

### XRCameraSystem
Handles XR camera functionality:
- Camera pose updates
- View management
- Projection matrix updates
- Camera input handling

### XRAnchorSystem
Manages spatial anchors:
- Anchor creation and tracking
- Persistent anchor storage
- Anchor pose updates
- Environment understanding

### XRLightProbeSystem
Handles environment lighting:
- Light probe creation
- Environment map generation
- Spherical harmonics coefficients
- Real-time lighting updates

### XRHapticsSystem
Manages haptic feedback:
- Controller vibration
- Haptic pulse patterns
- Intensity control
- Duration management

### XRDetectedMeshSystem
Handles environment mesh detection:
- Mesh extraction
- Mesh visualization
- Collision detection
- Spatial understanding

## XR State Management

### XRState
Global XR settings and state:
- Session management
- Scene positioning
- Scale management
- User height tracking
- Session mode support
- Input source tracking
- Depth data management

### XRRendererState
Manages XR rendering:
- WebGL binding
- Projection layer
- Render target management
- Frame handling

## XR Features

### Session Management
- Inline, immersive AR, and immersive VR modes
- Session lifecycle handling
- Mode support detection
- Session state tracking

### Camera Features
- Stereo rendering
- Camera pose tracking
- View management
- Projection handling
- Camera image access

### Environment Understanding
- Light estimation
- Environment mapping
- Spatial anchors
- Mesh detection
- Depth sensing

### Input Handling
- Controller tracking
- Hand tracking
- Input source management
- Haptic feedback

## Usage Examples

### Starting an XR Session
```typescript
import { requestXRSession } from '@ir-engine/spatial'

// Start an immersive VR session
await requestXRSession({ mode: 'immersive-vr' })

// Start an immersive AR session
await requestXRSession({ mode: 'immersive-ar' })

// Start an inline session
await requestXRSession({ mode: 'inline' })
```

### Creating a Spatial Anchor
```typescript
import { XRAnchorComponent } from '@ir-engine/spatial'

const entity = createEntity()
setComponent(entity, XRAnchorComponent, {
  anchor: xrAnchor
})
```

### Setting Up Hand Tracking
```typescript
import { XRLeftHandComponent, XRRightHandComponent } from '@ir-engine/spatial'

const leftHand = createEntity()
setComponent(leftHand, XRLeftHandComponent, {
  rotations: new Float32Array(4 * 19)
})

const rightHand = createEntity()
setComponent(rightHand, XRRightHandComponent, {
  rotations: new Float32Array(4 * 19)
})
```

## Best Practices

1. Session Management:
   - Check session mode support before requesting
   - Handle session end gracefully
   - Clean up resources on session end
   - Consider fallback modes

2. Performance Optimization:
   - Use appropriate quality settings
   - Optimize render targets
   - Manage memory usage
   - Handle frame timing

3. Input Handling:
   - Support multiple input types
   - Handle input source changes
   - Implement appropriate haptics
   - Consider accessibility

4. Environment Understanding:
   - Use appropriate anchor types
   - Handle environment changes
   - Manage light estimation
   - Consider privacy implications

5. Platform Support:
   - Support both WebXR and 8th Wall
   - Handle platform-specific features
   - Consider device capabilities
   - Implement fallbacks 