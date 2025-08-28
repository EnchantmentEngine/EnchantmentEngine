export const StorageTypes = {
  Local: 0,
  S3: 1
} as const

export type StorageTypes = (typeof StorageTypes)[keyof typeof StorageTypes]
