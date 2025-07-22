import { Color, ShadowMaterial as Shadow } from 'three'

import { BoolArg, ColorArg } from '../constants/DefaultArgs'
import { MaterialPrototypeDefinition } from '../MaterialComponent'

export const ShadowMaterialArguments = {
  color: { ...ColorArg, default: new Color('#000') },
  fog: { ...BoolArg, default: true },
  transparent: { ...BoolArg, default: true }
}

export const ShadowMaterial: MaterialPrototypeDefinition = {
  prototypeConstructor: Shadow,
  arguments: ShadowMaterialArguments
}
