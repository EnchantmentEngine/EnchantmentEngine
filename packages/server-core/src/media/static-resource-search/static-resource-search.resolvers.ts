import type { HookContext } from '@feathersjs/feathers'
import { resolve, virtual } from '@feathersjs/schema'
import {
  DEFAULT_SEARCH_PARAMS,
  StaticResourceSearchQueryType,
  StaticResourceSearchResultType
} from '@ir-engine/common/src/schemas/media/static-resource-search.schema'
import { fromDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { Application } from '../../../declarations'

export const staticResourceSearchResultResolver = resolve<StaticResourceSearchResultType, HookContext<Application>>({
  // Format timestamps
  createdAt: virtual(async (result) => fromDateTimeSql(result.createdAt)),
  updatedAt: virtual(async (result) => fromDateTimeSql(result.updatedAt)),

  // Ensure search score is properly formatted
  searchScore: virtual(async (result) => {
    if (typeof result.searchScore === 'number') {
      return Math.round(result.searchScore * 1000) / 1000 // Round to 3 decimal places
    }
    return 0
  })
})

export const staticResourceSearchQueryResolver = resolve<StaticResourceSearchQueryType, HookContext<Application>>({
  // Set default values for optional parameters
  searchField: async (value) => value || DEFAULT_SEARCH_PARAMS.searchField,
  similarityThreshold: async (value) => value || DEFAULT_SEARCH_PARAMS.similarityThreshold,
  $limit: async (value) => {
    if (value === undefined) return DEFAULT_SEARCH_PARAMS.limit
    return Math.min(Math.max(value, 1), 100) // Clamp between 1 and 100
  },
  $skip: async (value) => Math.max(value || 0, 0), // Ensure non-negative

  // Sanitize search query
  semanticSearch: async (value) => {
    if (typeof value !== 'string') {
      throw new Error('Search query must be a string')
    }

    // Trim whitespace and limit length
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      throw new Error('Search query cannot be empty')
    }
    if (trimmed.length > 500) {
      throw new Error('Search query too long (max 500 characters)')
    }

    return trimmed
  }
})
