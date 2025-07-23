import { ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import { SmsData } from '@ir-engine/common/src/schemas/user/sms.schema'

import { Application } from '../../../declarations'
import { sendSmsWithAWS } from './awssns'

export interface SmsParams extends KnexAdapterParams {}

/**
 * A class for Github Repo Access Webhook service
 */
export class SmsService implements ServiceInterface<SmsData, SmsData, SmsParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(data: SmsData, params?: SmsParams) {
    await sendSmsWithAWS(data.mobile, data.text)
    return data
  }
}
