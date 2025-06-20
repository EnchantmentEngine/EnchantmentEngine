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

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineNodeMaterialPlugin } from '@ir-engine/engine/src/material/defineNodeMaterialPlugin'
import { float, mix, mul, uniform, vec3 } from 'three/tsl'

export const WebGPUCSMPlugin = defineNodeMaterialPlugin({
  name: 'WebGPUCSMPlugin',
  jsonID: 'IR_webgpu_csm_plugin',

  uniforms: S.Object({
    csmFade: S.Bool({ default: true }),
    shadowIntensity: S.Number({ default: 1.0 }),
    shadowBias: S.Number({ default: 0.0001 }),
    cascadeBlendDistance: S.Number({ default: 0.1 }),

    shadowSoftness: S.Number({ default: 1.0 }),
    ambientShadowColor: S.Array(S.Number(), { default: [0.1, 0.1, 0.2] }),
    shadowColorTint: S.Array(S.Number(), { default: [0.8, 0.8, 1.0] })
  }),

  wgslCode: `
    // Simple shadow enhancement function
    fn enhanceShadowColor(baseColor: vec3<f32>, shadowFactor: f32, tintColor: vec3<f32>, intensity: f32) -> vec3<f32> {
      let shadowAmount = (100.0 - shadowFactor) * intensity;
      return mix(baseColor, baseColor * tintColor, shadowAmount);
    }
  `,

  onApplyNode: (material, uniforms) => {
    console.log('WebGPU CSM Plugin uniforms:', uniforms)
    console.log('WebGPU CSM Plugin uniforms type:', typeof uniforms)
    console.log('WebGPU CSM Plugin uniforms keys:', uniforms ? Object.keys(uniforms) : 'null/undefined')

    if (!uniforms) {
      console.warn('WebGPU CSM Plugin: Uniforms is null/undefined, using defaults')
      uniforms = {}
    }

    const shadowIntensity = uniforms.shadowIntensity ?? 1.0
    const shadowBias = uniforms.shadowBias ?? 0.0001
    const cascadeBlendDistance = uniforms.cascadeBlendDistance ?? 0.1
    const shadowSoftness = uniforms.shadowSoftness ?? 1.0
    const ambientShadowColor = uniforms.ambientShadowColor ?? [0.1, 0.1, 0.2]
    const shadowColorTint = uniforms.shadowColorTint ?? [0.8, 0.8, 1.0]
    const csmFade = uniforms.csmFade ?? true

    console.log('WebGPU CSM Plugin processed values:', {
      shadowIntensity,
      shadowColorTint,
      ambientShadowColor
    })

    const shadowIntensityUniform = uniform(shadowIntensity)
    const shadowColorTintUniform = uniform(shadowColorTint)
    const ambientShadowColorUniform = uniform(ambientShadowColor)

    if (material.colorNode) {
      const tintedColor = mul(material.colorNode, vec3(shadowColorTintUniform))
      const ambientColor = vec3(ambientShadowColorUniform)

      const enhancedColor = mix(
        material.colorNode,
        mix(tintedColor, ambientColor, float(0.2)),
        mul(shadowIntensityUniform, float(0.3)) // Blend factor based on intensity
      )

      console.log('WebGPU CSM Plugin: Applied shadow color enhancement')
    } else {
      material.colorNode = vec3(1.0, 1.0, 1.0)
      console.log('WebGPU CSM Plugin: Created new color node')
    }

    material.userData = material.userData || {}
    material.userData.webgpuCSMEnhanced = true
    material.userData.csmPluginValues = {
      shadowIntensity,
      shadowBias,
      cascadeBlendDistance,
      shadowSoftness,
      ambientShadowColor,
      shadowColorTint,
      csmFade
    }
    material.userData.originalUniforms = uniforms
  },

  update: (material, uniforms, deltaSeconds) => {}
})

export const supportsWebGPUCSM = (material: any): boolean => {
  return material && (material.isNodeMaterial || material.isMeshStandardNodeMaterial)
}

export const applyWebGPUCSMEnhancements = (
  material: any,
  options: {
    shadowIntensity?: number
    shadowSoftness?: number
    ambientShadowColor?: number[]
    shadowColorTint?: number[]
  } = {}
) => {
  if (!supportsWebGPUCSM(material)) {
    console.warn('Material does not support WebGPU CSM enhancements')
    return
  }

  const {
    shadowIntensity = 1.0,
    shadowSoftness = 1.0,
    ambientShadowColor = [0.1, 0.1, 0.2],
    shadowColorTint = [0.8, 0.8, 1.0]
  } = options

  if (material.userData) {
    material.userData.csmEnhanced = true
    material.userData.shadowIntensity = shadowIntensity
    material.userData.shadowSoftness = shadowSoftness
    material.userData.ambientShadowColor = ambientShadowColor
    material.userData.shadowColorTint = shadowColorTint
  }

  material.needsUpdate = true
}
