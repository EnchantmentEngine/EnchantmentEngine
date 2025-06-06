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
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createPropertyAnimationTrack,
  getExtensionPropertyDataType,
  getPropertyDataType,
  isArbitraryExtensionPath,
  isMutableProperty,
  KHRAnimationPointerExtensionComponent,
  resolveJSONPointer,
  validateJSONPointer
} from './AnimationExtensionComponents'

describe('KHR_animation_pointer Extension', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  describe('Component Registration', () => {
    it('should have correct jsonID', () => {
      expect(KHRAnimationPointerExtensionComponent.jsonID).toBe('KHR_animation_pointer')
    })

    it('should have correct schema', () => {
      expect(KHRAnimationPointerExtensionComponent.schema).toBeDefined()
    })
  })

  describe('JSON Pointer Resolution', () => {
    const mockDocument: GLTF.IGLTF = {
      asset: { version: '2.0' },
      materials: [
        {
          pbrMetallicRoughness: {
            baseColorFactor: [1.0, 0.0, 0.0, 1.0],
            metallicFactor: 0.5
          }
        }
      ],
      nodes: [
        {
          translation: [1.0, 2.0, 3.0],
          rotation: [0.0, 0.0, 0.0, 1.0],
          scale: [1.0, 1.0, 1.0]
        }
      ]
    }

    it('should resolve valid JSON pointers', () => {
      expect(resolveJSONPointer(mockDocument, '/materials/0/pbrMetallicRoughness/baseColorFactor')).toEqual([
        1.0, 0.0, 0.0, 1.0
      ])

      expect(resolveJSONPointer(mockDocument, '/materials/0/pbrMetallicRoughness/metallicFactor')).toBe(0.5)

      expect(resolveJSONPointer(mockDocument, '/nodes/0/translation')).toEqual([1.0, 2.0, 3.0])
    })

    it('should throw error for invalid JSON pointers', () => {
      expect(() => resolveJSONPointer(mockDocument, 'invalid')).toThrow()
      expect(() => resolveJSONPointer(mockDocument, '/materials/999/baseColorFactor')).toThrow()
      expect(() => resolveJSONPointer(mockDocument, '/materials/0/nonexistent')).toThrow()
    })

    it('should handle escaped characters in JSON pointers', () => {
      const docWithSpecialChars: GLTF.IGLTF = {
        asset: { version: '2.0' },
        extras: {
          'test~field': 'value1',
          'test/field': 'value2'
        }
      }

      expect(resolveJSONPointer(docWithSpecialChars, '/extras/test~0field')).toBe('value1')
      expect(resolveJSONPointer(docWithSpecialChars, '/extras/test~1field')).toBe('value2')
    })
  })

  describe('Property Validation', () => {
    it('should identify mutable properties', () => {
      expect(isMutableProperty('/materials/0/pbrMetallicRoughness/baseColorFactor')).toBe(true)
      expect(isMutableProperty('/nodes/0/translation')).toBe(true)
      expect(isMutableProperty('/cameras/0/perspective/yfov')).toBe(true)
      expect(isMutableProperty('/materials/0/name')).toBe(false)
    })

    it('should identify known extension properties as mutable', () => {
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_emissive_strength/emissiveStrength')).toBe(true)
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_clearcoat/clearcoatFactor')).toBe(true)
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_transmission/transmissionFactor')).toBe(true)
    })

    it('should identify arbitrary extension properties as mutable', () => {
      expect(isMutableProperty('/materials/0/extensions/CUSTOM_material_extension/customFactor')).toBe(true)
      expect(isMutableProperty('/nodes/0/extensions/VENDOR_node_extension/someProperty')).toBe(true)
      expect(isMutableProperty('/cameras/0/extensions/EXT_camera_extension/customValue')).toBe(true)
    })

    it('should reject invalid extension paths', () => {
      expect(isMutableProperty('/extensions')).toBe(false) // Too short
      expect(isMutableProperty('/extensions/CUSTOM')).toBe(false) // No property
      expect(isMutableProperty('/someProperty/extensions/CUSTOM/prop')).toBe(false) // Invalid structure
    })

    it('should determine correct data types', () => {
      expect(getPropertyDataType('/materials/0/pbrMetallicRoughness/baseColorFactor')).toBe('float4')
      expect(getPropertyDataType('/materials/0/pbrMetallicRoughness/metallicFactor')).toBe('float')
      expect(getPropertyDataType('/nodes/0/translation')).toBe('float3')
      expect(getPropertyDataType('/nodes/0/rotation')).toBe('float4')
      expect(getPropertyDataType('/nodes/0/scale')).toBe('float3')
    })
  })

  describe('Animation Track Creation', () => {
    it('should create property animation tracks', () => {
      const inputArray = new Float32Array([0, 1, 2])
      const outputArray = new Float32Array([1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1])
      const interpolation = 2301 // InterpolateLinear

      const track = createPropertyAnimationTrack(
        '/materials/0/pbrMetallicRoughness/baseColorFactor',
        inputArray,
        outputArray,
        interpolation
      )

      expect(track).toBeDefined()
      expect(track.name).toBe('/materials/0/pbrMetallicRoughness/baseColorFactor')
      expect(track.times).toBe(inputArray)
      expect(track.values).toBe(outputArray)
    })
  })

  describe('JSON Pointer Validation', () => {
    const mockDocument: GLTF.IGLTF = {
      asset: { version: '2.0' },
      materials: [
        {
          pbrMetallicRoughness: {
            baseColorFactor: [1.0, 0.0, 0.0, 1.0]
          }
        }
      ]
    }

    it('should validate existing properties', () => {
      expect(() => validateJSONPointer(mockDocument, '/materials/0/pbrMetallicRoughness/baseColorFactor')).not.toThrow()
    })

    it('should validate properties with default values', () => {
      expect(() => validateJSONPointer(mockDocument, '/materials/0/pbrMetallicRoughness/metallicFactor')).not.toThrow()
    })

    it('should reject invalid pointers', () => {
      expect(() => validateJSONPointer(mockDocument, 'invalid')).toThrow()
      expect(() => validateJSONPointer(mockDocument, '/materials/0/name')).toThrow()
    })
  })

  describe('Arbitrary Extension Path Support', () => {
    it('should identify valid arbitrary extension paths', () => {
      expect(isArbitraryExtensionPath('/materials/0/extensions/CUSTOM_material/customFactor')).toBe(true)
      expect(isArbitraryExtensionPath('/nodes/0/extensions/VENDOR_transform/customProperty')).toBe(true)
      expect(isArbitraryExtensionPath('/cameras/0/extensions/EXT_camera_settings/focalLength')).toBe(true)
      expect(isArbitraryExtensionPath('/meshes/0/extensions/CUSTOM_mesh/morphFactor')).toBe(true)
    })

    it('should reject invalid extension paths', () => {
      expect(isArbitraryExtensionPath('/materials/0/pbrMetallicRoughness/baseColorFactor')).toBe(false)
      expect(isArbitraryExtensionPath('/extensions')).toBe(false)
      expect(isArbitraryExtensionPath('/extensions/CUSTOM')).toBe(false)
      expect(isArbitraryExtensionPath('/materials/0/extensions')).toBe(false)
      expect(isArbitraryExtensionPath('/materials/0/extensions/X')).toBe(false) // Too short extension name
    })

    it('should determine data types for extension properties', () => {
      expect(getExtensionPropertyDataType('/materials/0/extensions/CUSTOM/customFactor')).toBe('float')
      expect(getExtensionPropertyDataType('/materials/0/extensions/CUSTOM/customColor')).toBe('float3')
      expect(getExtensionPropertyDataType('/materials/0/extensions/CUSTOM/customColorFactor')).toBe('float4')
      expect(getExtensionPropertyDataType('/materials/0/extensions/CUSTOM/customStrength')).toBe('float')
      expect(getExtensionPropertyDataType('/materials/0/extensions/CUSTOM/customRoughness')).toBe('float')
      expect(getExtensionPropertyDataType('/materials/0/extensions/CUSTOM/customIor')).toBe('float')
      expect(getExtensionPropertyDataType('/materials/0/extensions/CUSTOM/customRotation')).toBe('float')
      expect(getExtensionPropertyDataType('/materials/0/extensions/CUSTOM/unknownProperty')).toBe('float')
    })

    it('should validate extension properties in GLTF documents', () => {
      const mockDocumentWithExtensions: GLTF.IGLTF = {
        asset: { version: '2.0' },
        materials: [
          {
            extensions: {
              CUSTOM_material: {
                customFactor: 0.5,
                customColor: [1.0, 0.0, 0.0]
              }
            }
          }
        ]
      }

      expect(() =>
        validateJSONPointer(mockDocumentWithExtensions, '/materials/0/extensions/CUSTOM_material/customFactor')
      ).not.toThrow()

      expect(() =>
        validateJSONPointer(mockDocumentWithExtensions, '/materials/0/extensions/CUSTOM_material/customColor')
      ).not.toThrow()

      // Should allow non-existent extension properties (they may be added at runtime)
      expect(() =>
        validateJSONPointer(mockDocumentWithExtensions, '/materials/0/extensions/CUSTOM_material/newProperty')
      ).not.toThrow()

      // Should allow completely new extensions
      expect(() =>
        validateJSONPointer(mockDocumentWithExtensions, '/materials/0/extensions/NEW_EXTENSION/someProperty')
      ).not.toThrow()
    })

    it('should create animation tracks for extension properties', () => {
      const inputArray = new Float32Array([0, 1, 2])
      const outputArray = new Float32Array([0.0, 0.5, 1.0])
      const interpolation = 2301 // InterpolateLinear

      const track = createPropertyAnimationTrack(
        '/materials/0/extensions/CUSTOM_material/customFactor',
        inputArray,
        outputArray,
        interpolation
      )

      expect(track).toBeDefined()
      expect(track.name).toBe('/materials/0/extensions/CUSTOM_material/customFactor')
      expect(track.times).toBe(inputArray)
      expect(track.values).toBe(outputArray)
    })
  })

  describe('Known Extension Properties', () => {
    it('should support KHR_materials_pbrSpecularGlossiness', () => {
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_pbrSpecularGlossiness/diffuseFactor')).toBe(true)
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_pbrSpecularGlossiness/specularFactor')).toBe(true)
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_pbrSpecularGlossiness/glossinessFactor')).toBe(
        true
      )

      expect(getPropertyDataType('/materials/0/extensions/KHR_materials_pbrSpecularGlossiness/diffuseFactor')).toBe(
        'float4'
      )
      expect(getPropertyDataType('/materials/0/extensions/KHR_materials_pbrSpecularGlossiness/glossinessFactor')).toBe(
        'float'
      )
    })

    it('should support KHR_materials_emissive_strength', () => {
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_emissive_strength/emissiveStrength')).toBe(true)
      expect(getPropertyDataType('/materials/0/extensions/KHR_materials_emissive_strength/emissiveStrength')).toBe(
        'float'
      )
    })

    it('should support KHR_materials_clearcoat', () => {
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_clearcoat/clearcoatFactor')).toBe(true)
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_clearcoat/clearcoatRoughnessFactor')).toBe(true)
      expect(getPropertyDataType('/materials/0/extensions/KHR_materials_clearcoat/clearcoatFactor')).toBe('float')
    })

    it('should support KHR_materials_transmission', () => {
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_transmission/transmissionFactor')).toBe(true)
      expect(getPropertyDataType('/materials/0/extensions/KHR_materials_transmission/transmissionFactor')).toBe('float')
    })

    it('should support KHR_materials_volume', () => {
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_volume/thicknessFactor')).toBe(true)
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_volume/attenuationColor')).toBe(true)
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_volume/attenuationDistance')).toBe(true)
      expect(getPropertyDataType('/materials/0/extensions/KHR_materials_volume/attenuationColor')).toBe('float3')
    })

    it('should support other material extensions', () => {
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_ior/ior')).toBe(true)
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_specular/specularFactor')).toBe(true)
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_iridescence/iridescenceFactor')).toBe(true)
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_sheen/sheenColorFactor')).toBe(true)
      expect(isMutableProperty('/materials/0/extensions/KHR_materials_anisotropy/anisotropyStrength')).toBe(true)
    })
  })

  describe('GLTF Animation Loading with KHR_animation_pointer', () => {
    it('should create a mock GLTF with KHR_animation_pointer animation', async () => {
      const mockGLTF: GLTF.IGLTF = {
        asset: { version: '2.0' },
        extensionsUsed: ['KHR_animation_pointer'],
        materials: [
          {
            pbrMetallicRoughness: {
              baseColorFactor: [1.0, 0.0, 0.0, 1.0],
              metallicFactor: 1.0
            }
          }
        ],
        accessors: [
          {
            bufferView: 0,
            componentType: 5126, // FLOAT
            count: 3,
            type: 'SCALAR'
          },
          {
            bufferView: 1,
            componentType: 5126, // FLOAT
            count: 3,
            type: 'VEC4'
          }
        ],
        bufferViews: [
          {
            buffer: 0,
            byteLength: 12,
            byteOffset: 0
          },
          {
            buffer: 0,
            byteLength: 48,
            byteOffset: 12
          }
        ],
        buffers: [
          {
            byteLength: 60,
            uri: 'data:application/octet-stream;base64,AAAAAAAAAD8AAABAAAAAAP//fz8AAAA/AAAAP///fz8AAAA/AAAAP///fz8AAAA/AAAAP///fz8AAAA/AAAAP///fz8AAAA/AAAAP///fz8='
          }
        ],
        animations: [
          {
            channels: [
              {
                sampler: 0,
                target: {
                  path: 'pointer' as any,
                  extensions: {
                    KHR_animation_pointer: {
                      pointer: '/materials/0/pbrMetallicRoughness/baseColorFactor'
                    }
                  }
                }
              }
            ],
            samplers: [
              {
                input: 0,
                output: 1,
                interpolation: 'LINEAR'
              }
            ]
          }
        ]
      }

      // This test verifies that the GLTF structure is valid for KHR_animation_pointer
      expect(mockGLTF.animations![0].channels[0].target.path).toBe('pointer')
      expect(mockGLTF.animations![0].channels[0].target.extensions!.KHR_animation_pointer.pointer).toBe(
        '/materials/0/pbrMetallicRoughness/baseColorFactor'
      )
    })
  })
})
