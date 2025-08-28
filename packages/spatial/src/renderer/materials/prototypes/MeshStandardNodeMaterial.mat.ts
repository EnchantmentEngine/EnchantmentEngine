import { MeshStandardNodeMaterial } from 'three/webgpu'

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

export const MeshStandardNodeArguments = {
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

export const MeshStandardNodeMaterialPrototype: MaterialPrototypeDefinition = {
  prototypeConstructor: MeshStandardNodeMaterial,
  arguments: MeshStandardNodeArguments
}

export default MeshStandardNodeMaterialPrototype
