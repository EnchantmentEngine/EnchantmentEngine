// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import {
  RecordingResourceQuery,
  RecordingResourceType
} from '@ir-engine/common/src/schemas/recording/recording-resource.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const recordingResourceResolver = resolve<RecordingResourceType, HookContext>({
  staticResource: virtual(async (recordingResource, context) => {
    if (context.event !== 'removed')
      return context.app.service(staticResourcePath).get(recordingResource.staticResourceId)
  }),
  createdAt: virtual(async (recordingResource) => fromDateTimeSql(recordingResource.createdAt)),
  updatedAt: virtual(async (recordingResource) => fromDateTimeSql(recordingResource.updatedAt))
})

export const recordingResourceExternalResolver = resolve<RecordingResourceType, HookContext>({})

export const recordingResourceDataResolver = resolve<RecordingResourceType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const recordingResourcePatchResolver = resolve<RecordingResourceType, HookContext>({
  updatedAt: getDateTimeSql
})

export const recordingResourceQueryResolver = resolve<RecordingResourceQuery, HookContext>({})
