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
