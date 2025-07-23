import type { HookContext } from '@feathersjs/feathers'
import { resolve, virtual } from '@feathersjs/schema'
import {
  StaticResourceVectorData,
  StaticResourceVectorPatch,
  StaticResourceVectorQuery,
  StaticResourceVectorType
} from '@ir-engine/common/src/schemas/media/static-resource-vector.schema'
import { fromDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { v4 as uuidv4 } from 'uuid'
import type { Application } from '../../../declarations'

export const staticResourceVectorResolver = resolve<StaticResourceVectorType, HookContext<Application>>({
  // Convert vector strings back to arrays for external use
  captionEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  tagsEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  materialEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  styleEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  object_typeEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  locationEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  colorEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  combinedEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  createdAt: virtual(async (staticResourceVector) => fromDateTimeSql(staticResourceVector.createdAt)),
  updatedAt: virtual(async (staticResourceVector) => fromDateTimeSql(staticResourceVector.updatedAt))
})

export const staticResourceVectorExternalResolver = resolve<StaticResourceVectorType, HookContext<Application>>({
  // Hide embeddings from external responses by default for performance
  captionEmbedding: async () => undefined,
  tagsEmbedding: async () => undefined,
  materialEmbedding: async () => undefined,
  styleEmbedding: async () => undefined,
  object_typeEmbedding: async () => undefined,
  locationEmbedding: async () => undefined,
  colorEmbedding: async () => undefined,
  combinedEmbedding: async () => undefined
})

// Helper function to convert embedding arrays to vector format
const convertEmbeddingToVector = (value: any) => {
  if (Array.isArray(value)) {
    return `[${value.join(',')}]`
  }
  return value
}

export const staticResourceVectorDataResolver = resolve<StaticResourceVectorData, HookContext<Application>>({
  id: async () => uuidv4(),
  captionEmbedding: async (value) => convertEmbeddingToVector(value),
  tagsEmbedding: async (value) => convertEmbeddingToVector(value),
  materialEmbedding: async (value) => convertEmbeddingToVector(value),
  styleEmbedding: async (value) => convertEmbeddingToVector(value),
  object_typeEmbedding: async (value) => convertEmbeddingToVector(value),
  locationEmbedding: async (value) => convertEmbeddingToVector(value),
  colorEmbedding: async (value) => convertEmbeddingToVector(value),
  combinedEmbedding: async (value) => convertEmbeddingToVector(value)
})

export const staticResourceVectorPatchResolver = resolve<StaticResourceVectorPatch, HookContext<Application>>({
  captionEmbedding: async (value) => convertEmbeddingToVector(value),
  tagsEmbedding: async (value) => convertEmbeddingToVector(value),
  materialEmbedding: async (value) => convertEmbeddingToVector(value),
  styleEmbedding: async (value) => convertEmbeddingToVector(value),
  object_typeEmbedding: async (value) => convertEmbeddingToVector(value),
  locationEmbedding: async (value) => convertEmbeddingToVector(value),
  colorEmbedding: async (value) => convertEmbeddingToVector(value),
  combinedEmbedding: async (value) => convertEmbeddingToVector(value)
})

export const staticResourceVectorQueryResolver = resolve<StaticResourceVectorQuery, HookContext<Application>>({})
