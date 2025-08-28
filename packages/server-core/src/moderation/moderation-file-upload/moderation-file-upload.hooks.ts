import { Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import { moderationPath } from '@ir-engine/common/src/schema.type.module'
import { SYNC } from 'feathers-sync'

const checkOwnership = async (context: HookContext) => {
  const { app, data, params } = context
  const { user } = params

  if (!user) {
    throw new Error('User not authenticated')
  }

  let parsedData
  try {
    parsedData = typeof data.args === 'string' ? JSON.parse(data.args) : data.args
  } catch (error) {
    throw new Error('Invalid data format')
  }

  if (!Array.isArray(parsedData)) {
    throw new Error('Data should be an array')
  }

  const moderationIds = parsedData.map((x) => x.moderationId)
  const moderation = await app.service(moderationPath).find({
    query: {
      id: { $in: moderationIds }
    }
  })

  if (moderation.data.some((x) => x.createdBy !== user.id)) {
    throw new Forbidden('You are not authorized to perform this action')
  }

  return context
}

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      (context) => {
        context[SYNC] = false
        return context
      },
      checkOwnership
    ],
    update: [],
    patch: [
      (context) => {
        context[SYNC] = false
        return context
      },
      checkOwnership
    ],
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
