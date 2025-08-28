// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  recordingResourcePath,
  RecordingResourceType
} from '@ir-engine/common/src/schemas/recording/recording-resource.schema'
import {
  RecordingDatabaseType,
  RecordingID,
  RecordingQuery,
  RecordingSchemaType,
  RecordingType
} from '@ir-engine/common/src/schemas/recording/recording.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

export const recordingDbToSchema = (rawData: RecordingDatabaseType): RecordingType => {
  let schema =
    typeof rawData.schema === 'string'
      ? (JSON.parse(rawData.schema) as RecordingSchemaType)
      : (rawData.schema as RecordingSchemaType)

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof schema === 'string') {
    schema = JSON.parse(schema)
  }

  return {
    ...rawData,
    schema
  }
}

export const recordingResolver = resolve<RecordingType, HookContext>(
  {
    resources: virtual(async (recording, context) => {
      const recordingResources = (await context.app.service(recordingResourcePath).find({
        query: {
          recordingId: recording.id
        },
        paginate: false
      })) as RecordingResourceType[]

      return recordingResources.map((resource) => resource.staticResource)
    }),
    userName: virtual(async (recording, context) => {
      const user = await context.app.service(userPath).get(recording.userId)

      return user.name
    }),
    createdAt: virtual(async (recording) => fromDateTimeSql(recording.createdAt)),
    updatedAt: virtual(async (recording) => fromDateTimeSql(recording.updatedAt))
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData) => {
      return recordingDbToSchema(rawData)
    }
  }
)

export const recordingExternalResolver = resolve<RecordingType, HookContext>({})

export const recordingDataResolver = resolve<RecordingDatabaseType, HookContext>(
  {
    id: async () => {
      return uuidv4() as RecordingID
    },
    createdAt: getDateTimeSql,
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData) => {
      return {
        ...rawData,
        schema: JSON.stringify(rawData.schema)
      }
    }
  }
)

export const recordingPatchResolver = resolve<RecordingType, HookContext>(
  {
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData) => {
      return {
        ...rawData,
        schema: JSON.stringify(rawData.schema)
      }
    }
  }
)

export const recordingQueryResolver = resolve<RecordingQuery, HookContext>({})
