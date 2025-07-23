import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { staticResourceSearchQueryValidator } from '@ir-engine/common/src/schemas/media/static-resource-search.schema'
import { iff, isProvider } from 'feathers-hooks-common'
import verifyScope from '../../hooks/verify-scope'
import logger from '../../ServerLogger'
import {
  staticResourceSearchQueryResolver,
  staticResourceSearchResultResolver
} from './static-resource-search.resolvers'

/**
 * Rate limiting hook to prevent abuse of search functionality
 */
const rateLimitSearch = async (context: HookContext) => {
  // Simple rate limiting - in production you might want to use Redis or similar
  const userId = context.params.user?.id
  const ip = context.params.ip
  const key = userId || ip || 'anonymous'

  // For now, just log the search request
  // In production, implement proper rate limiting
  logger.info(`Search request from ${key}: "${context.params.query?.semanticSearch}"`)

  return context
}

/**
 * Validate search parameters
 */
const validateSearchParams = async (context: HookContext) => {
  const query = context.params.query

  if (!query?.semanticSearch) {
    throw new BadRequest('Search query is required')
  }

  // Additional validation can be added here
  if (query.semanticSearch.length < 2) {
    throw new BadRequest('Search query must be at least 2 characters long')
  }

  return context
}

/**
 * Log search analytics
 */
const logSearchAnalytics = async (context: HookContext) => {
  try {
    const semanticSearch = context.params.query?.semanticSearch
    const searchField = context.params.query?.searchField
    const resultCount = context.result?.data?.length || 0
    const userId = context.params.user?.id

    // Log search for analytics (in production, send to analytics service)
    logger.info('Search Analytics: %o', {
      semanticSearch,
      searchField,
      resultCount,
      userId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    // Don't fail the request if analytics logging fails
    logger.error('Failed to log search analytics:', error)
  }

  return context
}

export default {
  around: {
    all: [],
    find: [schemaHooks.resolveResult(staticResourceSearchResultResolver)]
  },

  before: {
    all: [],
    find: [
      // Validate user has permission to search
      iff(isProvider('external'), verifyScope('user', 'read')),

      // Rate limiting
      iff(isProvider('external'), rateLimitSearch),

      // Validate and resolve query parameters
      schemaHooks.validateQuery(staticResourceSearchQueryValidator),
      schemaHooks.resolveQuery(staticResourceSearchQueryResolver),

      // Additional validation
      validateSearchParams
    ]
  },

  after: {
    all: [],
    find: [
      // Log search analytics
      logSearchAnalytics
    ]
  },

  error: {
    all: [],
    find: []
  }
} as any
