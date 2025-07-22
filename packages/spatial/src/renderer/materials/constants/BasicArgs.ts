import {
  AdditiveBlending,
  AddOperation,
  BackSide,
  Color,
  DoubleSide,
  FrontSide,
  MixOperation,
  MultiplyBlending,
  MultiplyOperation,
  NoBlending,
  NormalBlending,
  ObjectSpaceNormalMap,
  SubtractiveBlending,
  TangentSpaceNormalMap
} from 'three'

import { BoolArg, ColorArg, FloatArg, NormalizedFloatArg, SelectArg, TextureArg, Vec2Arg } from './DefaultArgs'

export const BasicArgs = {
  alphaTest: { ...NormalizedFloatArg, default: 0 },
  alphaMap: TextureArg,
  map: TextureArg,
  color: { ...ColorArg, default: new Color(1, 1, 1) },
  opacity: { ...FloatArg, default: 1 },
  blending: {
    ...SelectArg,
    default: NormalBlending,
    options: [
      { label: 'Normal', value: NormalBlending },
      { label: 'Additive', value: AdditiveBlending },
      { label: 'Subtractive', value: SubtractiveBlending },
      { label: 'Multiply', value: MultiplyBlending },
      { label: 'None', value: NoBlending }
    ]
  },
  depthTest: { ...BoolArg, default: true },
  depthWrite: { ...BoolArg, default: true },
  side: {
    ...SelectArg,
    default: FrontSide,
    options: [
      { label: 'Front', value: FrontSide },
      { label: 'Back', value: BackSide },
      { label: 'Both', value: DoubleSide }
    ]
  },
  toneMapped: { default: true, type: 'boolean' },
  transparent: { default: false, type: 'boolean' },
  vertexColors: { default: false, type: 'boolean' }
}

export const BumpMapArgs = {
  bumpMap: TextureArg,
  bumpScale: { ...FloatArg, default: 1 }
}

export const LightMapArgs = {
  lightMap: TextureArg,
  lightMapIntensity: { default: 1.0, type: 'float' }
}

export const DisplacementMapArgs = {
  displacementMap: TextureArg,
  displacementScale: { ...FloatArg, default: 1 },
  displacementBias: { ...FloatArg, default: 0 }
}

export const EmissiveMapArgs = {
  emissive: { ...ColorArg, default: new Color(0, 0, 0) },
  emissiveMap: TextureArg,
  emissiveIntensity: { ...FloatArg, default: 1.0 }
}

export const EnvMapArgs = {
  combine: {
    ...SelectArg,
    default: MultiplyOperation,
    options: [
      { label: 'Multiply', value: MultiplyOperation },
      { label: 'Mix', value: MixOperation },
      { label: 'Add', value: AddOperation }
    ]
  },
  envMap: TextureArg,
  envMapIntensity: { ...FloatArg, default: 1.0 },
  reflectivity: { ...FloatArg, default: 1 },
  refractionRatio: { ...FloatArg, default: 0.98 }
}

export const AoMapArgs = {
  aoMap: TextureArg,
  aoMapIntensity: { ...NormalizedFloatArg, default: 1 }
}

export const MetalnessMapArgs = {
  metalness: { ...FloatArg, default: 0 },
  metalnessMap: TextureArg
}

export const NormalMapArgs = {
  normalMap: TextureArg,
  normalMapType: {
    ...SelectArg,
    default: TangentSpaceNormalMap,
    options: [
      { label: 'Object Space', value: ObjectSpaceNormalMap },
      { label: 'Tangent Space', value: TangentSpaceNormalMap }
    ]
  },
  normalScale: Vec2Arg
}

export const RoughhnessMapArgs = {
  roughness: { ...FloatArg, default: 1 },
  roughnessMap: TextureArg
}
