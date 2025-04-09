# Renderer Module

The Renderer Module provides a comprehensive 3D rendering system built on top of Three.js, offering advanced features like post-processing effects, shadow mapping, and performance optimization. It integrates with the ECS architecture and provides a flexible rendering pipeline.

## Core Components

### RendererComponent
The main renderer component that provides rendering capabilities:
- WebGL renderer configuration
- Effect composer for post-processing
- Scene management
- XR support
- Shadow mapping (CSM)
- Performance monitoring

### Light Components
Various light components for scene illumination:
- `AmbientLightComponent`: Global ambient lighting
- `DirectionalLightComponent`: Directional light with shadows
- `HemisphereLightComponent`: Sky/ground hemisphere lighting
- `PointLightComponent`: Omnidirectional point light
- `SpotLightComponent`: Directional spotlight with falloff

### Scene Components
Scene-level components for environment setup:
- `BackgroundComponent`: Scene background configuration
- `EnvironmentMapComponent`: Environment map for reflections
- `FogComponent`: Scene fog settings

## Renderer Systems

### WebGLRendererSystem
The main rendering system that:
- Manages WebGL context
- Handles render passes
- Processes post-processing effects
- Manages XR rendering
- Handles shadow mapping
- Optimizes performance

### LightTransformSystem
Manages light transformations:
- Updates light positions/orientations
- Handles shadow camera updates
- Manages light hierarchy

### ViewportLightingSystem
Handles viewport-specific lighting:
- Viewport light management
- Light intensity adjustments
- Light color updates

### DebugRendererSystem
Provides debugging capabilities:
- Visual debugging tools
- Performance metrics
- Scene statistics

### RenderInfoSystem
Monitors rendering performance:
- FPS tracking
- Draw call counting
- Memory usage monitoring
- Scene complexity analysis

## Renderer State Management

### RendererState
Global renderer settings:
- Quality level configuration
- Post-processing settings
- Shadow settings
- Debug options
- Render mode selection
- Grid and helper visibility

### PerformanceState
Performance monitoring:
- GPU/CPU tier detection
- Performance metrics
- Frame timing
- Memory usage

## Render Modes

The renderer supports multiple rendering modes:
- `UNLIT`: Basic unlit rendering
- `LIT`: Standard PBR lighting
- `SHADOW`: Shadow mapping enabled
- `WIREFRAME`: Wireframe visualization
- `NORMALS`: Normal visualization

## Usage Examples

### Setting Up a Renderer
```typescript
import { RendererComponent } from '@ir-engine/spatial'

const entity = createEntity()
setComponent(entity, RendererComponent, {
  renderer: new WebGLRenderer(),
  effectComposer: new EffectComposer(),
  scene: new Scene()
})
```

### Adding Lights
```typescript
import { DirectionalLightComponent } from '@ir-engine/spatial'

const lightEntity = createEntity()
setComponent(lightEntity, DirectionalLightComponent, {
  color: 0xffffff,
  intensity: 1,
  castShadow: true
})
```

### Configuring Render Settings
```typescript
import { RendererState } from '@ir-engine/spatial'

getMutableState(RendererState).merge({
  qualityLevel: 5,
  usePostProcessing: true,
  useShadows: true,
  renderScale: 1
})
```

## Best Practices

1. Optimize render settings:
   - Adjust quality level based on target platform
   - Enable/disable features based on performance needs
   - Use appropriate render scale for target resolution

2. Manage lighting efficiently:
   - Use appropriate light types for different scenarios
   - Configure shadow settings based on scene complexity
   - Consider light hierarchy for performance

3. Handle post-processing:
   - Enable/disable effects based on performance
   - Configure effect parameters appropriately
   - Consider mobile device limitations

4. Monitor performance:
   - Track FPS and frame time
   - Monitor draw calls and memory usage
   - Use debug tools for optimization

5. Handle XR rendering:
   - Configure XR-specific settings
   - Optimize for VR performance
   - Handle XR-specific lighting 