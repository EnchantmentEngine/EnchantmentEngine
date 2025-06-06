/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { GLTF } from '@gltf-transform/core'
import { defineComponent, S } from '@ir-engine/ecs'
import { BooleanKeyframeTrack, NumberKeyframeTrack, VectorKeyframeTrack } from 'three'

/**
 * KHR_animation_pointer Extension Component
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_animation_pointer
 *
 * This extension provides a standardized way of animating arbitrary glTF properties
 * according to the glTF 2.0 Asset Object Model using JSON pointers.
 */
export const KHRAnimationPointerExtensionComponent = defineComponent({
  name: 'KHRAnimationPointerExtensionComponent',
  jsonID: 'KHR_animation_pointer',

  schema: S.Object({
    pointer: S.String()
  })
})

/**
 * Data type mapping from glTF Asset Object Model to Three.js accessor types
 * Based on the KHR_animation_pointer specification
 */
export const ASSET_OBJECT_MODEL_TYPE_MAP = {
  bool: 'SCALAR',
  float: 'SCALAR',
  'float[]': 'SCALAR',
  float2: 'VEC2',
  float3: 'VEC3',
  float4: 'VEC4',
  float2x2: 'MAT2',
  float3x3: 'MAT3',
  float4x4: 'MAT4',
  int: 'SCALAR'
} as const

/**
 * Mutable properties according to the glTF 2.0 Asset Object Model
 * These are the properties that can be animated using KHR_animation_pointer
 */
export const MUTABLE_PROPERTIES = new Set([
  // Node properties
  '/nodes/*/translation',
  '/nodes/*/rotation',
  '/nodes/*/scale',
  '/nodes/*/weights',

  // Material properties
  '/materials/*/pbrMetallicRoughness/baseColorFactor',
  '/materials/*/pbrMetallicRoughness/metallicFactor',
  '/materials/*/pbrMetallicRoughness/roughnessFactor',
  '/materials/*/emissiveFactor',
  '/materials/*/alphaCutoff',
  '/materials/*/normalTexture/scale',
  '/materials/*/occlusionTexture/strength',

  // Camera properties
  '/cameras/*/perspective/aspectRatio',
  '/cameras/*/perspective/yfov',
  '/cameras/*/perspective/zfar',
  '/cameras/*/perspective/znear',
  '/cameras/*/orthographic/xmag',
  '/cameras/*/orthographic/ymag',
  '/cameras/*/orthographic/zfar',
  '/cameras/*/orthographic/znear',

  // Light properties (KHR_lights_punctual)
  '/extensions/KHR_lights_punctual/lights/*/color',
  '/extensions/KHR_lights_punctual/lights/*/intensity',
  '/extensions/KHR_lights_punctual/lights/*/range',
  '/extensions/KHR_lights_punctual/lights/*/spot/innerConeAngle',
  '/extensions/KHR_lights_punctual/lights/*/spot/outerConeAngle'
])

/**
 * Known extension properties that are safe to animate
 * This includes both standardized extensions and common custom extensions
 */
export const EXTENSION_MUTABLE_PROPERTIES = new Set([
  // KHR_materials_pbrSpecularGlossiness
  '/materials/*/extensions/KHR_materials_pbrSpecularGlossiness/diffuseFactor',
  '/materials/*/extensions/KHR_materials_pbrSpecularGlossiness/specularFactor',
  '/materials/*/extensions/KHR_materials_pbrSpecularGlossiness/glossinessFactor',

  // KHR_materials_emissive_strength
  '/materials/*/extensions/KHR_materials_emissive_strength/emissiveStrength',

  // KHR_materials_clearcoat
  '/materials/*/extensions/KHR_materials_clearcoat/clearcoatFactor',
  '/materials/*/extensions/KHR_materials_clearcoat/clearcoatRoughnessFactor',

  // KHR_materials_transmission
  '/materials/*/extensions/KHR_materials_transmission/transmissionFactor',

  // KHR_materials_volume
  '/materials/*/extensions/KHR_materials_volume/thicknessFactor',
  '/materials/*/extensions/KHR_materials_volume/attenuationColor',
  '/materials/*/extensions/KHR_materials_volume/attenuationDistance',

  // KHR_materials_ior
  '/materials/*/extensions/KHR_materials_ior/ior',

  // KHR_materials_specular
  '/materials/*/extensions/KHR_materials_specular/specularFactor',
  '/materials/*/extensions/KHR_materials_specular/specularColorFactor',

  // KHR_materials_iridescence
  '/materials/*/extensions/KHR_materials_iridescence/iridescenceFactor',
  '/materials/*/extensions/KHR_materials_iridescence/iridescenceIor',
  '/materials/*/extensions/KHR_materials_iridescence/iridescenceThicknessMinimum',
  '/materials/*/extensions/KHR_materials_iridescence/iridescenceThicknessMaximum',

  // KHR_materials_sheen
  '/materials/*/extensions/KHR_materials_sheen/sheenColorFactor',
  '/materials/*/extensions/KHR_materials_sheen/sheenRoughnessFactor',

  // KHR_materials_anisotropy
  '/materials/*/extensions/KHR_materials_anisotropy/anisotropyStrength',
  '/materials/*/extensions/KHR_materials_anisotropy/anisotropyRotation'
])

/**
 * Resolves a JSON pointer to a value in the glTF document
 * Based on RFC 6901: https://www.rfc-editor.org/info/rfc6901
 */
export function resolveJSONPointer(document: GLTF.IGLTF, pointer: string): any {
  if (!pointer.startsWith('/')) {
    throw new Error(`Invalid JSON pointer: ${pointer}. Must start with '/'`)
  }

  if (pointer === '/') {
    return document
  }

  const tokens = pointer
    .slice(1)
    .split('/')
    .map((token) => {
      // Unescape JSON pointer tokens according to RFC 6901
      return token.replace(/~1/g, '/').replace(/~0/g, '~')
    })

  let current: any = document

  for (const token of tokens) {
    if (current === null || current === undefined) {
      throw new Error(`Cannot resolve JSON pointer ${pointer}: null or undefined value encountered`)
    }

    if (Array.isArray(current)) {
      const index = parseInt(token, 10)
      if (isNaN(index) || index < 0 || index >= current.length) {
        throw new Error(`Invalid array index in JSON pointer ${pointer}: ${token}`)
      }
      current = current[index]
    } else if (typeof current === 'object') {
      if (!(token in current)) {
        throw new Error(`Property not found in JSON pointer ${pointer}: ${token}`)
      }
      current = current[token]
    } else {
      throw new Error(`Cannot traverse JSON pointer ${pointer}: ${token} is not an object or array`)
    }
  }

  return current
}

/**
 * Checks if a JSON pointer targets a mutable property according to the glTF 2.0 Asset Object Model
 * or known extension properties
 */
export function isMutableProperty(pointer: string): boolean {
  // Check exact matches first
  if (MUTABLE_PROPERTIES.has(pointer)) {
    return true
  }

  // Check pattern matches (replace array indices with *)
  const pattern = pointer.replace(/\/\d+/g, '/*')
  if (MUTABLE_PROPERTIES.has(pattern)) {
    return true
  }

  // Check known extension properties
  if (EXTENSION_MUTABLE_PROPERTIES.has(pointer) || EXTENSION_MUTABLE_PROPERTIES.has(pattern)) {
    return true
  }

  // Allow arbitrary extension paths for custom extensions
  if (isArbitraryExtensionPath(pointer)) {
    return true
  }

  return false
}

/**
 * Checks if a JSON pointer targets an arbitrary extension property
 * This allows animation of custom extension properties not explicitly defined in the spec
 */
export function isArbitraryExtensionPath(pointer: string): boolean {
  // Must be within an extensions object
  if (!pointer.includes('/extensions/')) {
    return false
  }

  // Split the pointer to analyze the structure
  const parts = pointer.split('/').filter((part) => part !== '') // Remove empty parts
  const extensionsIndex = parts.indexOf('extensions')

  if (extensionsIndex === -1) {
    return false
  }

  // Must have at least: [object]/[index]/extensions/[extensionName]/[property]
  // So minimum 5 parts: ['materials', '0', 'extensions', 'CUSTOM', 'prop']
  if (parts.length < 5) {
    return false
  }

  // Check if we have the right structure before extensions
  if (extensionsIndex < 2) {
    return false // Need at least object type and index before extensions
  }

  const objectType = parts[extensionsIndex - 2]
  const arrayIndex = parts[extensionsIndex - 1]
  const validObjectTypes = [
    'materials',
    'nodes',
    'meshes',
    'cameras',
    'lights',
    'textures',
    'images',
    'samplers',
    'buffers',
    'bufferViews',
    'accessors'
  ]

  // Check if we have valid object type and array index
  if (!validObjectTypes.includes(objectType) || !/^\d+$/.test(arrayIndex)) {
    return false
  }

  // Check if we have extension name and at least one property
  if (extensionsIndex + 2 >= parts.length) {
    return false
  }

  const extensionName = parts[extensionsIndex + 1]

  // Extension name should follow naming conventions (vendor prefix)
  if (!extensionName || extensionName.length < 3) {
    return false
  }

  // Allow any property within a valid extension
  return true
}

/**
 * Determines the expected data type for a property based on its JSON pointer
 */
export function getPropertyDataType(pointer: string): string {
  // Node transform properties
  if (pointer.includes('/translation') || pointer.includes('/scale')) return 'float3'
  if (pointer.includes('/rotation')) return 'float4'
  if (pointer.includes('/weights')) return 'float[]'

  // Material properties
  if (pointer.includes('/baseColorFactor') || pointer.includes('/emissiveFactor')) return 'float4'
  if (
    pointer.includes('/metallicFactor') ||
    pointer.includes('/roughnessFactor') ||
    pointer.includes('/alphaCutoff') ||
    pointer.includes('/scale') ||
    pointer.includes('/strength')
  )
    return 'float'

  // Camera properties
  if (
    pointer.includes('/aspectRatio') ||
    pointer.includes('/yfov') ||
    pointer.includes('/zfar') ||
    pointer.includes('/znear') ||
    pointer.includes('/xmag') ||
    pointer.includes('/ymag')
  )
    return 'float'

  // Light properties
  if (pointer.includes('/color')) return 'float3'
  if (
    pointer.includes('/intensity') ||
    pointer.includes('/range') ||
    pointer.includes('/innerConeAngle') ||
    pointer.includes('/outerConeAngle')
  )
    return 'float'

  // Extension-specific properties
  if (pointer.includes('/extensions/')) {
    return getExtensionPropertyDataType(pointer)
  }

  // Default to float for unknown properties
  return 'float'
}

/**
 * Determines the data type for extension properties
 */
export function getExtensionPropertyDataType(pointer: string): string {
  // KHR_materials_pbrSpecularGlossiness
  if (pointer.includes('/diffuseFactor') || pointer.includes('/specularFactor')) return 'float4'
  if (pointer.includes('/glossinessFactor')) return 'float'

  // Color properties (typically float3 or float4)
  if (pointer.includes('Color') || pointer.includes('/color')) {
    // Check if it's likely to have alpha
    if (pointer.includes('Factor') || pointer.includes('diffuse') || pointer.includes('specular')) {
      return 'float4'
    }
    return 'float3'
  }

  // Factor properties (typically float)
  if (
    pointer.includes('Factor') ||
    pointer.includes('Strength') ||
    pointer.includes('Roughness') ||
    pointer.includes('Metallic') ||
    pointer.includes('/ior') ||
    pointer.includes('Thickness') ||
    pointer.includes('Rotation') ||
    pointer.includes('Distance')
  ) {
    return 'float'
  }

  // Attempt to infer from property name patterns
  const propertyName = pointer.split('/').pop()?.toLowerCase() || ''

  if (propertyName.includes('color')) return 'float3'
  if (
    propertyName.includes('factor') ||
    propertyName.includes('strength') ||
    propertyName.includes('intensity') ||
    propertyName.includes('roughness') ||
    propertyName.includes('metallic') ||
    propertyName.includes('ior') ||
    propertyName.includes('thickness') ||
    propertyName.includes('rotation') ||
    propertyName.includes('distance') ||
    propertyName.includes('angle')
  ) {
    return 'float'
  }

  // Default to float for extension properties
  return 'float'
}

/**
 * Validates that an output accessor is compatible with the target property
 */
export function validateAccessorCompatibility(
  pointer: string,
  outputAccessor: { type: string; componentType: number; normalized?: boolean }
): boolean {
  const propertyDataType = getPropertyDataType(pointer)
  const expectedAccessorType = ASSET_OBJECT_MODEL_TYPE_MAP[propertyDataType]

  if (!expectedAccessorType) {
    throw new Error(`Unknown property data type: ${propertyDataType}`)
  }

  if (outputAccessor.type !== expectedAccessorType) {
    return false
  }

  // Additional validation for component types
  if (propertyDataType === 'bool') {
    // Bool properties must use unsigned byte component type
    return outputAccessor.componentType === 5121 // UNSIGNED_BYTE
  }

  if (propertyDataType === 'int') {
    // Int properties must use non-normalized integer component types
    const validIntTypes = [5120, 5122, 5125] // BYTE, SHORT, UNSIGNED_INT
    return validIntTypes.includes(outputAccessor.componentType) && !outputAccessor.normalized
  }

  return true
}

/**
 * Creates a property animation track for KHR_animation_pointer
 */
export function createPropertyAnimationTrack(
  pointer: string,
  inputArray: ArrayLike<number>,
  outputArray: ArrayLike<number>,
  interpolation: number
): any {
  const propertyDataType = getPropertyDataType(pointer)

  let TrackType: any
  switch (propertyDataType) {
    case 'bool':
      TrackType = BooleanKeyframeTrack
      break
    case 'float':
    case 'int':
    case 'float[]':
      TrackType = NumberKeyframeTrack
      break
    case 'float2':
    case 'float3':
    case 'float4':
    case 'float2x2':
    case 'float3x3':
    case 'float4x4':
      TrackType = VectorKeyframeTrack
      break
    default:
      TrackType = NumberKeyframeTrack
  }

  // Use the JSON pointer as the track name for property animations
  const trackName = `${pointer}`

  return new TrackType(trackName, inputArray, outputArray, interpolation)
}

/**
 * Validates that a JSON pointer is properly formatted and targets a defined property
 */
export function validateJSONPointer(document: GLTF.IGLTF, pointer: string): void {
  if (!pointer.startsWith('/')) {
    throw new Error(`Invalid JSON pointer format: ${pointer}. Must start with '/'`)
  }

  if (!isMutableProperty(pointer)) {
    throw new Error(`Property is not mutable according to glTF 2.0 Asset Object Model: ${pointer}`)
  }

  try {
    // Check if the property exists or has a default value
    const value = resolveJSONPointer(document, pointer)
    if (value === undefined) {
      // Check if this property has a spec-defined default value or is an extension property
      if (!hasDefaultValue(pointer) && !isArbitraryExtensionPath(pointer)) {
        throw new Error(`Property not defined and has no default value: ${pointer}`)
      }
    }
  } catch (error) {
    // Allow properties that don't exist but have default values or are extension properties
    if (!hasDefaultValue(pointer) && !isArbitraryExtensionPath(pointer)) {
      throw error
    }
  }
}

/**
 * Checks if a property has a spec-defined default value
 */
function hasDefaultValue(pointer: string): boolean {
  // Properties with spec-defined defaults
  const defaultValueProperties = new Set([
    '/materials/*/pbrMetallicRoughness/metallicFactor', // default: 1.0
    '/materials/*/pbrMetallicRoughness/roughnessFactor', // default: 1.0
    '/materials/*/pbrMetallicRoughness/baseColorFactor', // default: [1.0, 1.0, 1.0, 1.0]
    '/materials/*/emissiveFactor', // default: [0.0, 0.0, 0.0]
    '/materials/*/alphaCutoff', // default: 0.5
    '/materials/*/normalTexture/scale', // default: 1.0
    '/materials/*/occlusionTexture/strength', // default: 1.0
    '/nodes/*/translation', // default: [0.0, 0.0, 0.0]
    '/nodes/*/rotation', // default: [0.0, 0.0, 0.0, 1.0]
    '/nodes/*/scale' // default: [1.0, 1.0, 1.0]
  ])

  // Check exact matches and pattern matches
  if (defaultValueProperties.has(pointer)) {
    return true
  }

  const pattern = pointer.replace(/\/\d+/g, '/*')
  return defaultValueProperties.has(pattern)
}
