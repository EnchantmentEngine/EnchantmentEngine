import { NotFound } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  recordingDataValidator,
  recordingPatchValidator,
  recordingPath,
  recordingQueryValidator
} from '@ir-engine/common/src/schemas/recording/recording.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'

import { HookContext } from '../../../declarations'
import isAction from '../../hooks/is-action'
import setLoggedinUserInBody from '../../hooks/set-loggedin-user-in-body'
import setLoggedinUserInQuery from '../../hooks/set-loggedin-user-in-query'
import verifyScope from '../../hooks/verify-scope'
import { RecordingService } from './recording.class'
import {
  recordingDataResolver,
  recordingExternalResolver,
  recordingPatchResolver,
  recordingQueryResolver,
  recordingResolver
} from './recording.resolvers'

/**
 * Sort result by user name
 * @param context
 * @returns
 */
const sortByUserName = async (context: HookContext<RecordingService>) => {
  if (context.params.query?.$sort?.['user']) {
    const sort = context.params.query.$sort['user']
    delete context.params.query.$sort['user']

    const query = context.service.createQuery(context.params)

    query.join(userPath, `${userPath}.id`, `${recordingPath}.userId`)
    query.orderBy(`${userPath}.name`, sort === 1 ? 'asc' : 'desc')
    query.select(`${recordingPath}.*`)

    context.params.knex = query
  }
}

/**
 * Ensure recording with the specified id exists
 * @param context
 * @returns
 */
const ensureRecording = async (context: HookContext<RecordingService>) => {
  const recording = context.app.service(recordingPath).get(context.id!)
  if (!recording) {
    throw new NotFound('Unable to find recording with this id')
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(recordingExternalResolver), schemaHooks.resolveResult(recordingResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(recordingQueryValidator), schemaHooks.resolveQuery(recordingQueryResolver)],
    find: [
      iff(
        isProvider('external'),
        iffElse(isAction('admin'), verifyScope('recording', 'read'), setLoggedinUserInQuery('userId'))
      ),
      discardQuery('action'),
      sortByUserName
    ],
    get: [iff(isProvider('external'), verifyScope('recording', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('recording', 'write')),
      setLoggedinUserInBody('userId'),
      schemaHooks.validateData(recordingDataValidator),
      schemaHooks.resolveData(recordingDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('recording', 'write')),
      schemaHooks.validateData(recordingPatchValidator),
      schemaHooks.resolveData(recordingPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('recording', 'write')), ensureRecording]
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
