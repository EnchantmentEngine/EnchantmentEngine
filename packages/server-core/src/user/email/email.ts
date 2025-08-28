import Mailer from 'feathers-mailer'
import smtpTransport from 'nodemailer-smtp-transport'

import { emailPath } from '@ir-engine/common/src/schemas/user/email.schema'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import hooks from './email.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [emailPath]: Mailer
  }
}

export default (app: Application): void => {
  app.use(emailPath, Mailer(smtpTransport({ ...config.email.smtp })))

  const service = app.service(emailPath)
  service.hooks(hooks)
}
