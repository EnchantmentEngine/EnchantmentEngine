import { MeshStandardMaterial as Standard } from 'three'

import {
  AoMapArgs,
  BasicArgs,
  BumpMapArgs,
  DisplacementMapArgs,
  EmissiveMapArgs,
  EnvMapArgs,
  LightMapArgs,
  MetalnessMapArgs,
  NormalMapArgs,
  RoughhnessMapArgs
} from '../constants/BasicArgs'
import { MaterialPrototypeDefinition } from '../MaterialComponent'

export const MeshStandardArguments = {
  ...BasicArgs,
  ...EmissiveMapArgs,
  ...EnvMapArgs,
  ...NormalMapArgs,
  ...BumpMapArgs,
  ...DisplacementMapArgs,
  ...RoughhnessMapArgs,
  ...MetalnessMapArgs,
  ...AoMapArgs,
  ...LightMapArgs
}

export const MeshStandardMaterial: MaterialPrototypeDefinition = {
  prototypeConstructor: Standard,
  arguments: MeshStandardArguments
}

export default MeshStandardMaterial
