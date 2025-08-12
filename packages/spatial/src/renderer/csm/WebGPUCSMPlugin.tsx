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
