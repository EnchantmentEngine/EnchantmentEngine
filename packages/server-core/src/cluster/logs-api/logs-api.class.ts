import { ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import config from '@ir-engine/common/src/config'

import { Application } from '../../../declarations'
import { logger } from '../../ServerLogger'
import { logToBigQuery } from './analytics-logger'

export interface LogsApiParams extends KnexAdapterParams {
  action?: string
}

/**
 * A class for LogsApi service
 */

export class LogsApiService implements ServiceInterface<void, any, LogsApiParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(log: any, params?: LogsApiParams) {
    if (config.client.logs.forceClientAggregate === 'true') {
      if (Array.isArray(log)) {
        for (const item of log) {
          await this._processLogItem(item, params?.action)
        }
      } else {
        await this._processLogItem(log, params?.action)
      }
    }
  }

  _processLogItem = async (log, action?: string) => {
    const { msg, level } = log
    switch (action) {
      case 'analytics':
        await logToBigQuery(log)
        break
      default:
        delete log.level
        delete log.msg
        logger[['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'analytics'].includes(level) ? level : 'info'](
          log,
          msg
        )
    }
  }
}
