// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { RoomCode } from '../social/location.schema'
import { dataValidator } from '../validators'

export const instanceProvisionPath = 'instance-provision'

export const instanceProvisionMethods = ['find'] as const

// Main data model schema
export const instanceProvisionSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    ipAddress: Type.Optional(Type.String()),
    p2p: Type.Optional(Type.Boolean()),
    port: Type.Optional(Type.String()),
    roomCode: TypedString<RoomCode>(),
    podName: Type.Optional(Type.String())
  },
  { $id: 'InstanceProvision', additionalProperties: false }
)
export interface InstanceProvisionType extends Static<typeof instanceProvisionSchema> {}

export const instanceProvisionValidator = /* @__PURE__ */ getValidator(instanceProvisionSchema, dataValidator)
