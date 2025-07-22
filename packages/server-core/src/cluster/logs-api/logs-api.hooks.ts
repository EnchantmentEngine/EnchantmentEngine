import { Application, HookContext } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff } from 'feathers-hooks-common'
import hasAction from '../../hooks/has-action'
import isAction from '../../hooks/is-action'
import { AnalyticsLogResolver, AnalyticsLogValidator, BQLogValidator } from './analytics-logger'

export const copyDataToParam = (property: string) => {
  return async (context: HookContext<Application>) => {
    if (!context.data || !context.data[property]) return
    context.params[property] = context.data[property]
    return context
  }
}

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      iff(
        hasAction,
        copyDataToParam('action'),
        iff(
          isAction('analytics'),
          schemaHooks.validateData(AnalyticsLogValidator),
          schemaHooks.resolveData(AnalyticsLogResolver),
          // Final check before creating new BigQuery record
          schemaHooks.validateData(BQLogValidator)
        )
      )
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
