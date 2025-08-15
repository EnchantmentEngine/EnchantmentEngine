import { NodeMaterial } from 'three/webgpu'

import { ObjectArg, ShaderArg } from '../constants/DefaultArgs'
import { MaterialPrototypeDefinition } from '../MaterialComponent'

export const NodeMaterialArguments = {
  colorNode: {
    type: 'node',
    default: null,
    description: 'Color output node'
  },
  alphaNode: {
    type: 'node',
    default: null,
    description: 'Alpha output node'
  },
  normalNode: {
    type: 'node',
    default: null,
    description: 'Normal output node'
  },
  positionNode: {
    type: 'node',
    default: null,
    description: 'Position output node'
  },
  customWGSL: {
    ...ShaderArg,
    type: 'wgsl',
    default: '',
    description: 'Custom WGSL shader code'
  },
  nodeGraph: {
    ...ObjectArg,
    default: {},
    description: 'Node graph definition for visual node editor'
  },
  uniforms: {
    ...ObjectArg,
    default: {},
    description: 'Custom uniforms for node material'
  }
}

export const NodeMaterialPrototype: MaterialPrototypeDefinition = {
  prototypeConstructor: NodeMaterial,
  arguments: NodeMaterialArguments
}

export default NodeMaterialPrototype
