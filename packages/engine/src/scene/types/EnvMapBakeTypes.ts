export const EnvMapBakeTypes = {
  Realtime: 'Realtime',
  Baked: 'Baked'
} as const

export type EnvMapBakeTypes = (typeof EnvMapBakeTypes)[keyof typeof EnvMapBakeTypes]
