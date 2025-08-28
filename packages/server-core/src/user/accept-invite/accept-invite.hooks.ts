import { disallow } from 'feathers-hooks-common'
import logger from '../../ServerLogger'
import config from '../../appconfig'

async function redirect(context) {
  try {
    const data = context.result
    if (data.error) {
      context.http.location = `${config.client.url}/?error=${data.error as string}`
    } else {
      let link = `${context.params.domain || config.client.url}/auth/magiclink?type=login&token=${data.token as string}`
      if (data.locationName) {
        let path = `/location/${data.locationName}`
        if (data.inviteCode) {
          path += path.indexOf('?') > -1 ? `&inviteCode=${data.inviteCode}` : `?inviteCode=${data.inviteCode}`
        }
        if (data.spawnPoint) {
          path += path.indexOf('?') > -1 ? `&spawnPoint=${data.spawnPoint}` : `?spawnPoint=${data.spawnPoint}`
        }
        if (data.spectate) {
          path += path.indexOf('?') > -1 ? `&spectate=${data.spectate}` : `?spectate=${data.spectate}`
        }
        if (data.instanceId) {
          path += `&instanceId=${data.instanceId}`
        }
        link += `&path=${path}`
      }
      context.http.location = link
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [redirect],
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
