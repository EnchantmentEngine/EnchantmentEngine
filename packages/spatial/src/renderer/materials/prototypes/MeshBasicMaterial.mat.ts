import { MeshBasicMaterial as Basic } from 'three'

import { AoMapArgs, BasicArgs, EmissiveMapArgs, EnvMapArgs, LightMapArgs } from '../constants/BasicArgs'
import { TextureArg } from '../constants/DefaultArgs'
import { MaterialPrototypeDefinition } from '../MaterialComponent'

export const MeshBasicArguments = {
  ...BasicArgs,
  ...EmissiveMapArgs,
  ...LightMapArgs,
  ...AoMapArgs,
  ...EnvMapArgs,
  specularMap: TextureArg
}

export const MeshBasicMaterial: MaterialPrototypeDefinition = {
  prototypeConstructor: Basic,
  arguments: MeshBasicArguments
}

export default MeshBasicMaterial
