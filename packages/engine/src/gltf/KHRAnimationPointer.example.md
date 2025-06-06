# KHR_animation_pointer Extension Implementation

This document provides examples and usage information for the KHR_animation_pointer extension implementation in the IR Engine.

## Overview

The KHR_animation_pointer extension allows animating arbitrary glTF properties using JSON pointers, extending beyond the standard node transformation and morph target animations.

## Specification

- **Extension Name**: `KHR_animation_pointer`
- **Specification**: [KHR_animation_pointer](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_animation_pointer)
- **Status**: Complete implementation

## Supported Properties

The implementation supports animating the following mutable properties according to the glTF 2.0 Asset Object Model:

### Node Properties
- `/nodes/{index}/translation` - Node position (float3)
- `/nodes/{index}/rotation` - Node rotation quaternion (float4)
- `/nodes/{index}/scale` - Node scale (float3)
- `/nodes/{index}/weights` - Morph target weights (float[])

### Material Properties
- `/materials/{index}/pbrMetallicRoughness/baseColorFactor` - Base color (float4)
- `/materials/{index}/pbrMetallicRoughness/metallicFactor` - Metallic factor (float)
- `/materials/{index}/pbrMetallicRoughness/roughnessFactor` - Roughness factor (float)
- `/materials/{index}/emissiveFactor` - Emissive color (float3)
- `/materials/{index}/alphaCutoff` - Alpha cutoff (float)
- `/materials/{index}/normalTexture/scale` - Normal texture scale (float)
- `/materials/{index}/occlusionTexture/strength` - Occlusion texture strength (float)

### Camera Properties
- `/cameras/{index}/perspective/aspectRatio` - Aspect ratio (float)
- `/cameras/{index}/perspective/yfov` - Field of view (float)
- `/cameras/{index}/perspective/zfar` - Far plane (float)
- `/cameras/{index}/perspective/znear` - Near plane (float)
- `/cameras/{index}/orthographic/xmag` - X magnification (float)
- `/cameras/{index}/orthographic/ymag` - Y magnification (float)
- `/cameras/{index}/orthographic/zfar` - Far plane (float)
- `/cameras/{index}/orthographic/znear` - Near plane (float)

### Light Properties (KHR_lights_punctual)
- `/extensions/KHR_lights_punctual/lights/{index}/color` - Light color (float3)
- `/extensions/KHR_lights_punctual/lights/{index}/intensity` - Light intensity (float)
- `/extensions/KHR_lights_punctual/lights/{index}/range` - Light range (float)
- `/extensions/KHR_lights_punctual/lights/{index}/spot/innerConeAngle` - Inner cone angle (float)
- `/extensions/KHR_lights_punctual/lights/{index}/spot/outerConeAngle` - Outer cone angle (float)

### Known Extension Properties
- `/materials/{index}/extensions/KHR_materials_pbrSpecularGlossiness/diffuseFactor` - Diffuse factor (float4)
- `/materials/{index}/extensions/KHR_materials_pbrSpecularGlossiness/specularFactor` - Specular factor (float4)
- `/materials/{index}/extensions/KHR_materials_pbrSpecularGlossiness/glossinessFactor` - Glossiness factor (float)
- `/materials/{index}/extensions/KHR_materials_emissive_strength/emissiveStrength` - Emissive strength (float)
- `/materials/{index}/extensions/KHR_materials_clearcoat/clearcoatFactor` - Clearcoat factor (float)
- `/materials/{index}/extensions/KHR_materials_clearcoat/clearcoatRoughnessFactor` - Clearcoat roughness (float)
- `/materials/{index}/extensions/KHR_materials_transmission/transmissionFactor` - Transmission factor (float)
- `/materials/{index}/extensions/KHR_materials_volume/thicknessFactor` - Thickness factor (float)
- `/materials/{index}/extensions/KHR_materials_volume/attenuationColor` - Attenuation color (float3)
- `/materials/{index}/extensions/KHR_materials_volume/attenuationDistance` - Attenuation distance (float)
- `/materials/{index}/extensions/KHR_materials_ior/ior` - Index of refraction (float)
- `/materials/{index}/extensions/KHR_materials_specular/specularFactor` - Specular factor (float)
- `/materials/{index}/extensions/KHR_materials_specular/specularColorFactor` - Specular color factor (float3)
- `/materials/{index}/extensions/KHR_materials_iridescence/iridescenceFactor` - Iridescence factor (float)
- `/materials/{index}/extensions/KHR_materials_iridescence/iridescenceIor` - Iridescence IOR (float)
- `/materials/{index}/extensions/KHR_materials_iridescence/iridescenceThicknessMinimum` - Min thickness (float)
- `/materials/{index}/extensions/KHR_materials_iridescence/iridescenceThicknessMaximum` - Max thickness (float)
- `/materials/{index}/extensions/KHR_materials_sheen/sheenColorFactor` - Sheen color factor (float3)
- `/materials/{index}/extensions/KHR_materials_sheen/sheenRoughnessFactor` - Sheen roughness factor (float)
- `/materials/{index}/extensions/KHR_materials_anisotropy/anisotropyStrength` - Anisotropy strength (float)
- `/materials/{index}/extensions/KHR_materials_anisotropy/anisotropyRotation` - Anisotropy rotation (float)

### Arbitrary Extension Properties
The implementation supports animating **any property within any extension**, including custom vendor extensions:
- `/materials/{index}/extensions/{EXTENSION_NAME}/{property}` - Any material extension property
- `/nodes/{index}/extensions/{EXTENSION_NAME}/{property}` - Any node extension property
- `/cameras/{index}/extensions/{EXTENSION_NAME}/{property}` - Any camera extension property
- `/meshes/{index}/extensions/{EXTENSION_NAME}/{property}` - Any mesh extension property
- And more...

## Example Usage

### Basic Material Animation

```json
{
  "asset": { "version": "2.0" },
  "extensionsUsed": ["KHR_animation_pointer"],
  "materials": [
    {
      "pbrMetallicRoughness": {
        "baseColorFactor": [1.0, 0.0, 0.0, 1.0]
      }
    }
  ],
  "animations": [
    {
      "channels": [
        {
          "sampler": 0,
          "target": {
            "path": "pointer",
            "extensions": {
              "KHR_animation_pointer": {
                "pointer": "/materials/0/pbrMetallicRoughness/baseColorFactor"
              }
            }
          }
        }
      ],
      "samplers": [
        {
          "input": 0,
          "output": 1,
          "interpolation": "LINEAR"
        }
      ]
    }
  ]
}
```

### Camera Field of View Animation

```json
{
  "animations": [
    {
      "channels": [
        {
          "sampler": 0,
          "target": {
            "path": "pointer",
            "extensions": {
              "KHR_animation_pointer": {
                "pointer": "/cameras/0/perspective/yfov"
              }
            }
          }
        }
      ],
      "samplers": [
        {
          "input": 0,
          "output": 1,
          "interpolation": "LINEAR"
        }
      ]
    }
  ]
}
```

### Light Intensity Animation

```json
{
  "extensionsUsed": ["KHR_animation_pointer", "KHR_lights_punctual"],
  "animations": [
    {
      "channels": [
        {
          "sampler": 0,
          "target": {
            "path": "pointer",
            "extensions": {
              "KHR_animation_pointer": {
                "pointer": "/extensions/KHR_lights_punctual/lights/0/intensity"
              }
            }
          }
        }
      ],
      "samplers": [
        {
          "input": 0,
          "output": 1,
          "interpolation": "STEP"
        }
      ]
    }
  ]
}
```

### Custom Extension Property Animation

```json
{
  "extensionsUsed": ["KHR_animation_pointer", "CUSTOM_material_extension"],
  "materials": [
    {
      "extensions": {
        "CUSTOM_material_extension": {
          "customFactor": 0.5,
          "customColor": [1.0, 0.0, 0.0]
        }
      }
    }
  ],
  "animations": [
    {
      "channels": [
        {
          "sampler": 0,
          "target": {
            "path": "pointer",
            "extensions": {
              "KHR_animation_pointer": {
                "pointer": "/materials/0/extensions/CUSTOM_material_extension/customFactor"
              }
            }
          }
        }
      ],
      "samplers": [
        {
          "input": 0,
          "output": 1,
          "interpolation": "LINEAR"
        }
      ]
    }
  ]
}
```

### Known Extension Animation

```json
{
  "extensionsUsed": ["KHR_animation_pointer", "KHR_materials_emissive_strength"],
  "animations": [
    {
      "channels": [
        {
          "sampler": 0,
          "target": {
            "path": "pointer",
            "extensions": {
              "KHR_animation_pointer": {
                "pointer": "/materials/0/extensions/KHR_materials_emissive_strength/emissiveStrength"
              }
            }
          }
        }
      ],
      "samplers": [
        {
          "input": 0,
          "output": 1,
          "interpolation": "LINEAR"
        }
      ]
    }
  ]
}
```

## Implementation Details

### Component Structure

The extension is implemented as a standard IR Engine component:

```typescript
export const KHRAnimationPointerExtensionComponent = defineComponent({
  name: 'KHRAnimationPointerExtensionComponent',
  jsonID: 'KHR_animation_pointer',
  schema: S.Object({
    pointer: S.String()
  })
})
```

### JSON Pointer Resolution

The implementation includes RFC 6901 compliant JSON pointer resolution:

```typescript
// Resolve a JSON pointer to a value in the glTF document
const value = resolveJSONPointer(document, '/materials/0/pbrMetallicRoughness/baseColorFactor')
```

### Property Validation

Properties are validated against the glTF 2.0 Asset Object Model:

```typescript
// Check if a property is mutable
const isMutable = isMutableProperty('/materials/0/pbrMetallicRoughness/baseColorFactor')

// Get the expected data type for a property
const dataType = getPropertyDataType('/materials/0/pbrMetallicRoughness/baseColorFactor') // 'float4'
```

### Animation Track Creation

Property animation tracks are created with appropriate Three.js keyframe track types:

```typescript
const track = createPropertyAnimationTrack(
  '/materials/0/pbrMetallicRoughness/baseColorFactor',
  inputArray,
  outputArray,
  interpolation
)
```

## Validation Rules

1. **JSON Pointer Format**: Must start with '/' and follow RFC 6901 syntax
2. **Property Mutability**: Only properties marked as mutable in the Asset Object Model can be animated
3. **Property Existence**: Properties must exist in the document or have spec-defined default values
4. **Accessor Compatibility**: Output accessor types must match the property data type
5. **Interpolation Constraints**: Boolean and integer properties must use STEP interpolation
6. **Extension Properties**: Any property within an extension is considered animatable
7. **Custom Extensions**: Arbitrary vendor extensions are supported for maximum flexibility

## Error Handling

The implementation provides comprehensive error handling:

- Invalid JSON pointer format
- Non-existent properties without default values
- Immutable property targets
- Incompatible accessor types
- Malformed extension data

Errors are logged as warnings and the problematic animation channels are skipped, allowing the rest of the animation to load successfully.

## Performance Considerations

- JSON pointer resolution is cached during loading
- Property validation is performed once during load time
- Animation tracks use the same Three.js infrastructure as standard animations
- No runtime performance impact compared to standard node animations

## Browser Compatibility

The implementation works in all browsers supported by the IR Engine, with no additional dependencies beyond the existing glTF loader infrastructure.
