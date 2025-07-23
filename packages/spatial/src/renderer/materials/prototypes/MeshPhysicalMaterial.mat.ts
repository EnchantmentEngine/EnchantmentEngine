import { MeshPhysicalMaterial as Physical } from 'three'

import { ColorArg, FloatArg, NormalizedFloatArg, TextureArg, Vec2Arg } from '../constants/DefaultArgs'
import { MaterialPrototypeDefinition } from '../MaterialComponent'
import { MeshStandardArguments as StandardDefaults } from './MeshStandardMaterial.mat'

export const MeshPhysicalArguments = {
  ...StandardDefaults,
  anisotropy: FloatArg,
  anisotropyMap: TextureArg,
  anisotropyRotation: FloatArg,
  attenuationColor: ColorArg,
  attenuationDistance: FloatArg,
  clearcoat: { ...NormalizedFloatArg, default: 0.5 },
  clearcoatMap: TextureArg,
  clearcoatNormalMap: TextureArg,
  clearcoatNormalScale: FloatArg,
  clearcoatRoughness: { ...NormalizedFloatArg, default: 0.5 },
  ior: { ...FloatArg, default: 1.5, min: 1.0, max: 2.333 },
  iridescence: NormalizedFloatArg,
  iridescenceMap: TextureArg,
  iridescenceIOR: { ...FloatArg, default: 1.3, min: 1.0, max: 2.333 },
  iridescenceThicknessMap: TextureArg,
  iridescenceThicknessRange: Vec2Arg,
  sheen: { ...NormalizedFloatArg, default: 0.5 },
  sheenMap: TextureArg,
  sheenColor: ColorArg,
  sheenColorMap: TextureArg,
  sheenRoughness: { ...NormalizedFloatArg, default: 0.5 },
  sheenRoughnessMap: TextureArg,
  specularIntensity: FloatArg,
  specularIntensityMap: TextureArg,
  specularColor: ColorArg,
  specularColorMap: TextureArg,
  thickness: FloatArg,
  thicknessMap: TextureArg,
  transmission: FloatArg,
  transmissionMap: TextureArg
}

export const MeshPhysicalMaterial: MaterialPrototypeDefinition = {
  prototypeConstructor: Physical,
  arguments: MeshPhysicalArguments
}

export default MeshPhysicalMaterial
