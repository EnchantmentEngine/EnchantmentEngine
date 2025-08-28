import { ObjectArg, ShaderArg } from './DefaultArgs'

export const NodeArg = { default: null, type: 'node' }
export const WGSLArg = { ...ShaderArg, type: 'wgsl', default: '' }
export const NodeGraphArg = { ...ObjectArg, type: 'nodeGraph', default: {} }

export const NodeMaterialArgs = {
  colorNode: {
    ...NodeArg,
    description: 'Color output node for the material'
  },
  alphaNode: {
    ...NodeArg,
    description: 'Alpha/opacity output node'
  },
  normalNode: {
    ...NodeArg,
    description: 'Normal output node for surface details'
  },
  positionNode: {
    ...NodeArg,
    description: 'Position output node for vertex displacement'
  },
  emissiveNode: {
    ...NodeArg,
    description: 'Emissive output node for self-illumination'
  },
  roughnessNode: {
    ...NodeArg,
    description: 'Roughness output node for surface properties'
  },
  metalnessNode: {
    ...NodeArg,
    description: 'Metalness output node for material type'
  },

  customWGSL: {
    ...WGSLArg,
    description: 'Custom WGSL shader code for advanced effects'
  },

  nodeGraph: {
    ...NodeGraphArg,
    description: 'Visual node graph definition'
  },

  nodeUniforms: {
    ...ObjectArg,
    description: 'Custom uniforms for node-based materials'
  }
}

export const ColorNodeArgs = {
  baseColorNode: {
    ...NodeArg,
    description: 'Base color node input'
  },
  tintColorNode: {
    ...NodeArg,
    description: 'Tint color node for color modification'
  }
}

export const TextureNodeArgs = {
  diffuseTextureNode: {
    ...NodeArg,
    description: 'Diffuse texture node'
  },
  normalTextureNode: {
    ...NodeArg,
    description: 'Normal map texture node'
  },
  roughnessTextureNode: {
    ...NodeArg,
    description: 'Roughness texture node'
  },
  metalnessTextureNode: {
    ...NodeArg,
    description: 'Metalness texture node'
  }
}

export const AnimationNodeArgs = {
  timeNode: {
    ...NodeArg,
    description: 'Time node for animations'
  },
  uvAnimationNode: {
    ...NodeArg,
    description: 'UV animation node'
  },
  waveNode: {
    ...NodeArg,
    description: 'Wave distortion node'
  }
}

export const EffectNodeArgs = {
  noiseNode: {
    ...NodeArg,
    description: 'Noise generation node'
  },
  gradientNode: {
    ...NodeArg,
    description: 'Gradient generation node'
  },
  maskNode: {
    ...NodeArg,
    description: 'Masking node for selective effects'
  }
}

export const AdvancedNodeArgs = {
  ...NodeMaterialArgs,
  ...ColorNodeArgs,
  ...TextureNodeArgs,
  ...AnimationNodeArgs,
  ...EffectNodeArgs
}
