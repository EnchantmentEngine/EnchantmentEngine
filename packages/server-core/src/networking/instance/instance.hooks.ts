import { BadRequest } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, discardQuery, iff, isProvider } from 'feathers-hooks-common'

import {
  InstanceData,
  instanceDataValidator,
  instancePatchValidator,
  instancePath,
  instanceQueryValidator,
  InstanceType
} from '@ir-engine/common/src/schemas/networking/instance.schema'
import { LocationID, locationPath, LocationType } from '@ir-engine/common/src/schemas/social/location.schema'

import { channelPath } from '@ir-engine/common/src/schema.type.module'
import { HookContext } from '../../../declarations'
import allowNullQuery from '../../hooks/allow-null-query'
import enableClientPagination from '../../hooks/enable-client-pagination'
import isAction from '../../hooks/is-action'
import verifyScope from '../../hooks/verify-scope'
import { generateRoomCode, InstanceService } from './instance.class'
import {
  instanceDataResolver,
  instanceExternalResolver,
  instancePatchResolver,
  instanceQueryResolver,
  instanceResolver
} from './instance.resolvers'

/**
 * Sort result by location name
 * @param context
 * @returns
 */
const sortByLocationName = async (context: HookContext<InstanceService>) => {
  if (context.params.query?.$sort?.['locationName']) {
    const sort = context.params.query.$sort['locationName']
    delete context.params.query.$sort['locationName']

    const query = context.service.createQuery(context.params)

    query.join(locationPath, `${locationPath}.id`, `${instancePath}.locationId`)
    query.orderBy(`${locationPath}.name`, sort === 1 ? 'asc' : 'desc')
    query.select(`${instancePath}.*`)

    context.params.knex = query
  }
}

/**
 * Add location search to query
 * @param context
 * @returns
 */
const addLocationSearchToQuery = async (context: HookContext<InstanceService>) => {
  const { action, search } = context.params.query || {}
  if (!search) return

  const foundLocations = (await context.app.service(locationPath)._find({
    query: { name: { $like: `%${search}%` } },
    paginate: false
  })) as any as LocationType[]

  context.params.query = {
    ...context.params.query,
    $or: [
      {
        id: {
          $like: `%${search}%`
        }
      },
      {
        locationId: {
          $like: `%${search}%`
        }
      },
      {
        channelId: {
          $like: `%${search}%`
        }
      },
      {
        ipAddress: {
          $like: `%${search}%`
        }
      },
      {
        locationId: {
          $in: foundLocations.map((item) => item.id as LocationID)
        }
      }
    ]
  }
}

/**
 * Ensure newly created instance has a unique room code
 * @param context
 * @returns
 */
const addRoomCode = async (context: HookContext<InstanceService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: InstanceData[] = Array.isArray(context.data) ? context.data : [context.data]

  for (const item of data) {
    let existingInstances: InstanceType[] = []

    do {
      item.roomCode = generateRoomCode()
      // We need to have unique room codes therefore checking if room code already exists
      existingInstances = (await context.service._find({
        query: {
          roomCode: item.roomCode,
          ended: false
        },
        paginate: false
      })) as any as InstanceType[]
    } while (existingInstances.length > 0)
  }

  return context
}

const createInstanceChannel = async (context: HookContext<InstanceService>) => {
  if (!context.result || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data = Array.isArray(context.result)
    ? context.result
    : 'data' in context.result
    ? context.result!.data
    : [context.result]

  for (const instance of data) {
    if (instance.locationId) {
      await context.app.service(channelPath).create({
        instanceId: instance.id
      })
    }
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(instanceExternalResolver), schemaHooks.resolveResult(instanceResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(instanceQueryValidator), schemaHooks.resolveQuery(instanceQueryResolver)],
    find: [
      iff(isProvider('external') && isAction('admin'), verifyScope('instance', 'read'), addLocationSearchToQuery),
      enableClientPagination(),
      discardQuery('search'),
      discardQuery('action'),
      allowNullQuery('ipAddress'),
      sortByLocationName
    ],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('instance', 'write')),
      schemaHooks.validateData(instanceDataValidator),
      schemaHooks.resolveData(instanceDataResolver),
      addRoomCode
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('instance', 'write')),
      schemaHooks.validateData(instancePatchValidator),
      schemaHooks.resolveData(instancePatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('instance', 'write'))]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [createInstanceChannel],
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
