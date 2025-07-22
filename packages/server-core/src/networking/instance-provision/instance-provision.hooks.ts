import { Forbidden } from '@feathersjs/errors'
import { moderationBanPath } from '@ir-engine/common/src/schema.type.module'
import { disallow } from 'feathers-hooks-common'

const isThisUserBanned = async (context: any) => {
  const { app, params } = context
  const { user } = params

  if (user) {
    const thisUserBanned = await app.service(moderationBanPath).find({
      query: {
        banUserId: user.id,
        banned: true,
        $limit: 0
      }
    })
    if (thisUserBanned.total > 0) {
      return new Forbidden('You are banned')
    }
  }
  return context
}

export default {
  before: {
    all: [],
    find: [isThisUserBanned],
    get: [disallow() /*iff(isProvider('external'), verifyScope('admin', 'admin') as any)*/],
    create: [disallow() /*iff(isProvider('external'), verifyScope('admin', 'admin') as any)*/],
    update: [disallow() /*iff(isProvider('external'), verifyScope('admin', 'admin') as any)*/],
    patch: [disallow() /*iff(isProvider('external'), verifyScope('admin', 'admin') as any)*/],
    remove: [disallow() /*iff(isProvider('external'), verifyScope('admin', 'admin') as any)*/]
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
