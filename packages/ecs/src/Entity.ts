import { OpaqueType } from '@ir-engine/hyperflux'

export type Entity = OpaqueType<'entity'> & number
export type EntityUUID = OpaqueType<'EntityUUID'> & string
export type SourceID = OpaqueType<'SourceID'> & string
export type EntityID = OpaqueType<'EntityID'> & string
export type EntityUUIDPair = { entitySourceID: SourceID; entityID: EntityID }

export const UndefinedEntity = 0 as Entity
