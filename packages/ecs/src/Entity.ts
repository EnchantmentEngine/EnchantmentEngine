import { matches, OpaqueType, Validator } from '@ir-engine/hyperflux'

export type Entity = OpaqueType<'entity'> & number
export type EntityUUID = OpaqueType<'EntityUUID'> & string
export type SourceID = OpaqueType<'SourceID'> & string
export type EntityID = OpaqueType<'EntityID'> & string
export type EntityUUIDPair = { entitySourceID: SourceID; entityID: EntityID }

export const UndefinedEntity = 0 as Entity

export const matchesEntity = matches.number as Validator<unknown, Entity>
export const matchesEntityUUID = matches.string as Validator<unknown, EntityUUID>
export const matchesEntityUUIDPair = matches.object as Validator<unknown, EntityUUIDPair>
export const matchesEntityID = matches.string as Validator<unknown, EntityID>
export const matchesEntitySourceID = matches.string as Validator<unknown, SourceID>
