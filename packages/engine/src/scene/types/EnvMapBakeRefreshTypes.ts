export const EnvMapBakeRefreshTypes = {
  OnAwake: 'OnAwake',
  EveryFrame: 'EveryFrame'
} as const

export type EnvMapBakeRefreshTypesType = (typeof EnvMapBakeRefreshTypes)[keyof typeof EnvMapBakeRefreshTypes]
