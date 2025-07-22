export const SkyTypeEnum = {
  color: 0,
  cubemap: 1,
  equirectangular: 2,
  skybox: 3
} as const

export type SkyTypeEnum = (typeof SkyTypeEnum)[keyof typeof SkyTypeEnum]
