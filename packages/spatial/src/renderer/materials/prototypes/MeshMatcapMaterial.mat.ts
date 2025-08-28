import { MeshMatcapMaterial as Matcap } from 'three'

import { BasicArgs, BumpMapArgs, DisplacementMapArgs, NormalMapArgs } from '../constants/BasicArgs'
import { BoolArg, TextureArg } from '../constants/DefaultArgs'
import { MaterialPrototypeDefinition } from '../MaterialComponent'

export const MeshMatcapArguments = {
  ...BasicArgs,
  ...BumpMapArgs,
  fog: BoolArg,
  matcap: TextureArg,
  ...NormalMapArgs,
  ...DisplacementMapArgs
}

export const MeshMatcapMaterial: MaterialPrototypeDefinition = {
  arguments: MeshMatcapArguments,
  prototypeConstructor: Matcap
}

export default MeshMatcapMaterial
