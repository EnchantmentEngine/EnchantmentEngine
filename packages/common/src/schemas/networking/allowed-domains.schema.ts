import { Static, Type } from '@feathersjs/typebox'

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

export const allowedDomainsPath = 'allowed-domains'

export const allowedDomainsMethods = ['find'] as const

export const allowedDomainsSchema = Type.Boolean()
export interface AllowedDomainsType {}

export const hasAccessSchema = Type.Object({
  hasStorageAccess: Type.Boolean(),
  cookieSet: Type.Boolean()
})

export interface HasAccessType extends Static<typeof hasAccessSchema> {}
