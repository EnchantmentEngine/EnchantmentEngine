import { Schema, TTypedSchema } from '@ir-engine/hyperflux'
import { Entity, EntityID, EntityUUID, SourceID } from './Entity'

export const ECSSchema = {
  /** Entity type schema helper, Entities will not be serialized, defaults to UndefinedEntity */
  Entity: (options?: TTypedSchema<Entity>['options']) =>
    Schema.Number({ serialized: true, id: 'Entity', ...options }) as unknown as TTypedSchema<Entity>,

  /** EntityUUID type schema helper, defaults to '' */
  EntityUUID: (options?: TTypedSchema<EntityUUID>['options']) =>
    Schema.String({ serialized: true, ...options, id: 'EntityUUID' }) as unknown as TTypedSchema<EntityUUID>,

  /** EntityUUID type schema helper, defaults to '' */
  EntityID: (options?: TTypedSchema<EntityID>['options']) =>
    Schema.String({ serialized: true, ...options, id: 'EntityID' }) as unknown as TTypedSchema<EntityID>,

  /** SourceID type schema helper, defaults to '' */
  SourceID: (options?: TTypedSchema<SourceID>['options']) =>
    Schema.String({ serialized: true, ...options, id: 'SourceID' })
}
