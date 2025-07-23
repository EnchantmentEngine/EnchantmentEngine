import { Color, ShaderMaterial as Shader } from 'three'

import { ColorArg, ObjectArg, ShaderArg } from '../constants/DefaultArgs'
import { MaterialPrototypeDefinition } from '../MaterialComponent'

export const ShaderMaterialArguments = {
  uniforms: {
    ...ObjectArg,
    default: {
      color: { ...ColorArg, default: new Color('#f00') }
    }
  },
  vertexShader: ShaderArg,
  fragmentShader: ShaderArg
}

export const ShaderMaterial: MaterialPrototypeDefinition = {
  prototypeConstructor: Shader,
  arguments: ShaderMaterialArguments
}
