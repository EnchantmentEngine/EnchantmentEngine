import { MeshLambertMaterial as Lambert } from 'three'

import { BasicArgs, EmissiveMapArgs, EnvMapArgs } from '../constants/BasicArgs'
import { BoolArg } from '../constants/DefaultArgs'
import { MaterialPrototypeDefinition } from '../MaterialComponent'

export const MeshLambertArguments = {
  ...BasicArgs,
  ...EmissiveMapArgs,
  ...EnvMapArgs,
  fog: BoolArg
}

export const MeshLambertMaterial: MaterialPrototypeDefinition = {
  prototypeConstructor: Lambert,
  arguments: MeshLambertArguments
}

// export const MeshLambertMaterial = defineComponent({
//   name: 'MeshLambertMaterial',
//   onInit: (entity) => {
//     return {
//       material: new Lambert()
//     }
//   },
// })

export default MeshLambertMaterial
