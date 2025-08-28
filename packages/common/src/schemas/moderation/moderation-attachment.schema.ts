import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const moderationAttachmentPath = 'moderation-attachment'
export const moderationAttachmentMethods = ['create', 'find'] as const

// Main data model schema
export const moderationAttachmentsSchema = Type.Object({
  id: Type.String({
    format: 'uuid'
  }),
  moderationId: Type.String({
    format: 'uuid'
  }),
  filePath: Type.String(),
  fileName: Type.String(),
  createdBy: TypedString<UserID>({
    format: 'uuid'
  }),
  updatedBy: TypedString<UserID>({
    format: 'uuid'
  }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
})
export interface ModerationAttachmentsType extends Static<typeof moderationAttachmentsSchema> {}

// Schema for creating new entries

export const moderationAttachmentsDataSchema = Type.Pick(
  moderationAttachmentsSchema,
  ['moderationId', 'filePath', 'fileName'],
  {
    $id: 'ModerationAttachmentsData'
  }
)
export interface ModerationAttachmentsData extends Static<typeof moderationAttachmentsDataSchema> {}

// Schema for updating existing entries
export const moderationAttachmentPatchSchema = Type.Partial(moderationAttachmentsSchema)

export interface ModerationAttachmentPatch extends Static<typeof moderationAttachmentPatchSchema> {}

// Schema for allowed query properties
export const moderationAttachmentsQueryProperties = Type.Pick(moderationAttachmentsSchema, ['id', 'moderationId'])

export const moderationAttachmentQuerySchema = Type.Intersect(
  [
    querySyntax(moderationAttachmentsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ModerationAttachmentQuery extends Static<typeof moderationAttachmentQuerySchema> {}

export const moderationAttachmentValidator = /* @__PURE__ */ getValidator(moderationAttachmentsSchema, dataValidator)
export const moderationAttachmentDataValidator = /* @__PURE__ */ getValidator(
  moderationAttachmentsDataSchema,
  dataValidator
)
export const moderationAttachmentPatchValidator = /* @__PURE__ */ getValidator(
  moderationAttachmentPatchSchema,
  dataValidator
)
export const moderationAttachmentQueryValidator = /* @__PURE__ */ getValidator(
  moderationAttachmentQuerySchema,
  queryValidator
)
