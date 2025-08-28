// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { StringEnum, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { InstanceID } from '../networking/instance.schema'

export const podsPath = 'pods'

export const podsMethods = ['find', 'get', 'remove'] as const

export const serverContainerInfoSchema = Type.Object(
  {
    name: Type.String(),
    restarts: Type.Number(),
    status: StringEnum(['Running', 'Terminated', 'Waiting', 'Undefined']),
    ready: Type.Boolean(),
    started: Type.Boolean(),
    image: Type.String()
  },
  { $id: 'ServerContainerInfo', additionalProperties: false }
)
export interface ServerContainerInfoType extends Static<typeof serverContainerInfoSchema> {}

export const serverPodInfoSchema = Type.Object(
  {
    name: Type.String(),
    status: Type.String(),
    age: Type.String({ format: 'date-time' }),
    containers: Type.Array(Type.Ref(serverContainerInfoSchema)),
    type: Type.Optional(Type.String()),
    locationSlug: Type.Optional(Type.String()),
    instanceId: Type.Optional(
      TypedString<InstanceID>({
        format: 'uuid'
      })
    ),
    currentUsers: Type.Optional(Type.Number())
  },
  { $id: 'ServerPodInfo', additionalProperties: false }
)
export interface ServerPodInfoType extends Static<typeof serverPodInfoSchema> {}

// Main data model schema
export const podsSchema = Type.Object(
  {
    id: Type.String(),
    label: Type.String(),
    pods: Type.Array(Type.Ref(serverPodInfoSchema))
  },
  { $id: 'Pods', additionalProperties: false }
)
export interface PodsType extends Static<typeof podsSchema> {}

// export const serverContainerInfoValidator = /* @__PURE__ */ getValidator(serverContainerInfoSchema, dataValidator)
// export const serverPodInfoValidator = /* @__PURE__ */ getValidator(serverPodInfoSchema, dataValidator)
// export const podsValidator = /* @__PURE__ */ getValidator(podsSchema, dataValidator)
