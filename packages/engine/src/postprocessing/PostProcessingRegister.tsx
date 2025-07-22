export const PropertyTypes = {
  BlendFunction: 0,
  Number: 1,
  Boolean: 2,
  Color: 3,
  ColorSpace: 4,
  KernelSize: 5,
  SMAAPreset: 6,
  EdgeDetectionMode: 7,
  PredicationMode: 8,
  Texture: 9,
  Vector2: 10,
  Vector3: 11,
  VignetteTechnique: 12
} as const

export type PropertyTypes = (typeof PropertyTypes)[keyof typeof PropertyTypes]
