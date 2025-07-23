import { ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'
import appRootPath from 'app-root-path'
import * as path from 'path'
import * as pug from 'pug'

import { emailPath } from '@ir-engine/common/src/schemas/user/email.schema'
import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { loginTokenPath } from '@ir-engine/common/src/schemas/user/login-token.schema'
import { smsPath } from '@ir-engine/common/src/schemas/user/sms.schema'

import { BadRequest } from '@feathersjs/errors'
import { EMAIL_REGEX } from '@ir-engine/common/src/regex'
import { userPath } from '@ir-engine/common/src/schema.type.module'
import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'

const emailAccountTemplatesPath = path.join(appRootPath.path, 'packages', 'server-core', 'email-templates', 'account')

export interface MagicLinkParams extends KnexAdapterParams {}

/**
 * A class for Magic Link service
 */
export class MagicLinkService implements ServiceInterface<MagicLinkParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * Filters existing identity providers to exclude those associated with deactivated users
   * @param existingIdentityProviders Array of identity providers to filter
   * @returns Array of identity providers with active users only
   */
  private async filterActiveIdentityProviders(existingIdentityProviders: any[]): Promise<any[]> {
    if (!existingIdentityProviders || existingIdentityProviders.length === 0) {
      return []
    }

    const activeProviders: any[] = []
    for (const provider of existingIdentityProviders) {
      try {
        const user = await this.app.service(userPath).get(provider.userId)
        if (!user.isDeactivated) {
          activeProviders.push(provider)
        }
      } catch (error) {
        if (error.code !== 404) {
          logger.error('Error checking user deactivation status for identity provider:', error)
        }
        // Skip providers with missing or errored users
      }
    }
    return activeProviders
  }

  /**
   * A function used to sent an email
   *
   * @param toEmail email of reciever
   * @param id generated login id
   * @param token generated login token
   * @param redirectUrl URL to redirect to after login
   * @returns {function} sent email
   */
  async sendEmail(toEmail: string, id: string, token: string, redirectUrl?: string): Promise<void> {
    const hashLink = `${config.server.url}/login/${id}?token=${token}${
      redirectUrl ? `&redirectUrl=${redirectUrl}` : ''
    }`

    const templatePath = path.join(emailAccountTemplatesPath, 'magiclink-email.pug')

    const compiledHTML = pug.compileFile(templatePath)({
      headerLogo: `${config.client.url}/static/Napster-Horizontal-Black.png`,
      templateBg: `${config.client.url}/static/Email-Template-BG.png`,
      hashLink
    })

    const mailSender = config.email.from
    const email = {
      from: mailSender,
      to: toEmail,
      subject: config.email.subject.login,
      html: compiledHTML
    }

    email.html = email.html.replace(/&amp;/g, '&')
    await this.app.service(emailPath).create(email)
  }

  /**
   * A function which used to send sms
   *
   * @param mobile of receiver user
   * @param id generated login id
   * @param token generated login token
   * @param redirectUrl URL to redirect to after login
   * @returns {function}  send sms
   */

  async sendSms(mobile: string, id: string, token: string, redirectUrl?: string): Promise<void> {
    const hashLink = `${config.server.url}/login/${id}?token=${token}${
      redirectUrl ? `&redirectUrl=${redirectUrl}` : ''
    }`
    const templatePath = path.join(emailAccountTemplatesPath, 'magiclink-sms.pug')
    const compiledHTML = pug
      .compileFile(templatePath)({
        title: config.client.title,
        hashLink
      })
      .replace(/&amp;/g, '&') // Text message links can't have HTML escaped ampersands.

    const sms = {
      mobile,
      text: compiledHTML
    }

    await this.app
      .service(smsPath)
      .create(sms, null!)
      .then(() => logger.info('Sent SMS'))
      .catch((err: any) => logger.error(err, `Error sending SMS: ${err.message}`))
  }
  /**
   * A function which is used to create magic link
   *
   * @param data used create magic link
   * @param params contain user info
   * @returns created data
   */

  async create(data: any, params?: MagicLinkParams) {
    const identityProviderService = this.app.service(identityProviderPath)

    // check magiclink type
    let token = ''
    if (data.type === 'email') {
      if (!EMAIL_REGEX.test(data.email)) {
        throw new BadRequest('Invalid email', {
          email: data.email
        })
      }
      token = data.email
    } else if (data.type === 'sms') token = data.mobile

    let identityProvider: IdentityProviderType
    const identityProviders = (
      await identityProviderService.find({
        query: {
          token: token,
          type: data.type
        }
      })
    ).data

    // Filter out identity providers associated with deactivated users
    const activeIdentityProviders = await this.filterActiveIdentityProviders(identityProviders)

    const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
      { accessToken: data.accessToken },
      {}
    )

    const identityProviderGuest = authResult[identityProviderPath]

    if (activeIdentityProviders.length === 0) {
      identityProvider = await identityProviderService.create(
        {
          token: token,
          type: data.type,
          accountIdentifier: token,
          userId: identityProviderGuest.userId,
          email: data.email
        },
        params as any
      )
    } else {
      identityProvider = activeIdentityProviders[0]
    }

    if (identityProvider) {
      await this.removePreviousLoginTokensByProvider(identityProvider.id)
      const loginToken = await this.app.service(loginTokenPath).create({
        identityProviderId: identityProvider.id
      })

      if (data.type === 'email') {
        await this.sendEmail(data.email, loginToken.id, loginToken.token, data.redirectUrl)
      } else if (data.type === 'sms') {
        await this.sendSms(data.mobile, loginToken.id, loginToken.token, data.redirectUrl)
      }
    }
    return data
  }

  private async removePreviousLoginTokensByProvider(identityProviderId: string) {
    const loginTokenService = this.app.service(loginTokenPath)
    await loginTokenService.remove(null, {
      query: {
        identityProviderId
      }
    })
  }
}
