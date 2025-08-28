// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import { userPath } from '@ir-engine/common/src/schema.type.module'
import {
  StaticResourceDatabaseType,
  StaticResourceType
} from '@ir-engine/common/src/schemas/media/static-resource.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'
import { getStorageProvider } from '../storageprovider/storageprovider'

export const staticResourceDbToSchema = (rawData: StaticResourceDatabaseType): StaticResourceType => {
  const dependencies = rawData.dependencies
    ? typeof rawData.dependencies === 'string'
      ? (JSON.parse(rawData.dependencies) as string[])
      : (rawData.dependencies as string[])
    : []

  const result: StaticResourceType = { ...rawData, url: '', dependencies, tags: undefined, stats: undefined }

  if (rawData.tags) {
    let tags = typeof rawData.tags === 'string' ? (JSON.parse(rawData.tags) as string[]) : (rawData.tags as string[])

    // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
    // was serialized multiple times, therefore we need to parse it twice.
    if (typeof tags === 'string') {
      tags = JSON.parse(tags)
    }

    result.tags = tags
  }

  if (rawData.stats) {
    let stats = typeof rawData.stats === 'string' ? (JSON.parse(rawData.stats) as Record<string, any>) : rawData.stats

    // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
    // was serialized multiple times, therefore we need to parse it twice.
    if (typeof stats === 'string') {
      stats = JSON.parse(stats)
    }

    result.stats = stats
  }

  return result
}

const getThumbnailURL = (staticResource: StaticResourceType, context: HookContext) => {
  if (context.method !== 'find' && context.method !== 'get') {
    return ''
  }

  const values = context.hashedThumbnailResults

  return values[staticResource.id]
}

/**
 * the first few characters of resources hashes are appended as a version identifier to allow for cache busting
 */

export const staticResourceResolver = resolve<StaticResourceType, HookContext>(
  {
    createdAt: virtual(async (staticResource) => fromDateTimeSql(staticResource.createdAt)),
    updatedAt: virtual(async (staticResource) => fromDateTimeSql(staticResource.updatedAt)),
    url: virtual(async (staticResource, context) => {
      const storageProvider = getStorageProvider()
      return (
        storageProvider.getCachedURL(staticResource.key, context.params.isInternal) +
        '?hash=' +
        staticResource.hash.slice(0, 6)
      )
    }),
    thumbnailURL: virtual(async (staticResource, context) => {
      return getThumbnailURL(staticResource, context)
    }),
    user: virtual(async (rawData, context) => {
      if (rawData.userId && context.method !== 'get') {
        try {
          return await context.app.service(userPath).get(rawData.userId)
        } catch (err) {
          return undefined
        }
      }
    })
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return staticResourceDbToSchema(rawData)
    }
  }
)

export const staticResourceDataResolver = resolve<StaticResourceType, HookContext>(
  {
    id: async () => {
      return uuidv4()
    },
    createdAt: getDateTimeSql,
    updatedAt: getDateTimeSql,
    updatedBy: async (_, __, context) => {
      return context.params?.user?.id || null
    }
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        tags: JSON.stringify(rawData.tags),
        dependencies: JSON.stringify(rawData.dependencies),
        stats: JSON.stringify(rawData.stats)
      }
    }
  }
)

export const staticResourcePatchResolver = resolve<StaticResourceType, HookContext>(
  {
    updatedAt: getDateTimeSql,
    updatedBy: async (_, __, context) => {
      return context.params?.user?.id || null
    }
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        tags: JSON.stringify(rawData.tags),
        dependencies: JSON.stringify(rawData.dependencies),
        stats: JSON.stringify(rawData.stats)
      }
    }
  }
)
