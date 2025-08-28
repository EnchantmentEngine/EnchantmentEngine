import { MeshToonMaterial as Toon } from 'three'

import { BasicArgs, DisplacementMapArgs, EmissiveMapArgs, NormalMapArgs } from '../constants/BasicArgs'
import { BoolArg, TextureArg } from '../constants/DefaultArgs'
import { MaterialPrototypeDefinition } from '../MaterialComponent'

export const MeshToonArguments = {
  ...BasicArgs,
  ...DisplacementMapArgs,
  ...EmissiveMapArgs,
  fog: BoolArg,
  gradientMap: TextureArg,
  ...NormalMapArgs
}

export const MeshToonMaterial: MaterialPrototypeDefinition = {
  prototypeConstructor: Toon,
  arguments: MeshToonArguments
}

export default MeshToonMaterial
