import { BadRequest } from '@feathersjs/errors/lib'
import { ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import { PodsType, ServerPodInfoType } from '@ir-engine/common/src/schemas/cluster/pods.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { getServerInfo, getServerLogs, removePod } from './pods-helper'

export interface PodsParams extends KnexAdapterParams {}

/**
 * A class for Pods service
 */
export class PodsService implements ServiceInterface<PodsType | string, ServerPodInfoType | undefined, PodsParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find(params?: PodsParams) {
    return getServerInfo(this.app)
  }

  async get(id: string, params?: PodsParams) {
    const [podName, containerName] = id.split('/')
    if (!podName) {
      logger.info('podName is required in request to find server logs')
      throw new BadRequest('podName is required in request to find server logs')
    } else if (!containerName) {
      logger.info('containerName is required in request to find server logs')
      throw new BadRequest('containerName is required in request to find server logs')
    }

    return await getServerLogs(podName, containerName, this.app)
  }

  async remove(podName: string) {
    return await removePod(this.app, podName)
  }
}
