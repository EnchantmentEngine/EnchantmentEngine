import { Paginated } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import * as path from 'path'
import * as pug from 'pug'

import { instancePath } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { ChannelID, channelPath } from '@ir-engine/common/src/schemas/social/channel.schema'
import { InviteType } from '@ir-engine/common/src/schemas/social/invite.schema'
import { locationPath } from '@ir-engine/common/src/schemas/social/location.schema'
import { acceptInvitePath } from '@ir-engine/common/src/schemas/user/accept-invite.schema'
import { EmailData, emailPath } from '@ir-engine/common/src/schemas/user/email.schema'
import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { SmsData, smsPath } from '@ir-engine/common/src/schemas/user/sms.schema'
import { userRelationshipPath } from '@ir-engine/common/src/schemas/user/user-relationship.schema'
import { UserID, UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application, HookContext } from '../../declarations'
import config from '../appconfig'
import logger from '../ServerLogger'

const emailAccountTemplatesPath = path.join(appRootPath.path, 'packages', 'server-core', 'email-templates', 'invite')

/**
 * A method which get an invite link
 *
 * @param type
 * @param id of accept invite
 * @param passcode
 * @returns invite link
 */
export function getInviteLink(type: string, id: string, passcode: string): string {
  return `${config.server.url}/${acceptInvitePath}/${id}?t=${passcode}`
}

async function generateEmail({
  app,
  result,
  toEmail,
  inviteType,
  inviterUsername,
  targetObjectId
}: {
  app: Application
  result: InviteType
  toEmail: string
  inviteType: string
  inviterUsername: string
  targetObjectId?: string
}): Promise<void> {
  if (config.testEnabled) {
    return
  }

  let channelName, locationName
  const hashLink = getInviteLink(inviteType, result.id, result.passcode!)

  const templatePath = path.join(emailAccountTemplatesPath, `magiclink-email-invite-${inviteType}.pug`)

  if (inviteType === 'channel') {
    const channel = await app.service(channelPath).get(targetObjectId! as ChannelID)
    channelName = channel.name
  }

  if (inviteType === 'location') {
    const location = await app.service(locationPath).get(targetObjectId!)
    locationName = location.name
  }

  if (inviteType === 'instance') {
    const instance = await app.service(instancePath).get(targetObjectId!)
    locationName = instance.location.name
  }

  const compiledHTML = pug.compileFile(templatePath)({
    logo: config.client.logo,
    title: config.client.title,
    channelName: channelName,
    locationName: locationName,
    inviterUsername: inviterUsername,
    hashLink
  })
  const mailSender = config.email.from
  const email: EmailData = {
    from: mailSender,
    to: toEmail,
    subject: config.client.title + ' ' + (config.email.subject[inviteType] || 'Invitation'),
    html: compiledHTML
  }

  email.html = email.html.replace(/&amp;/g, '&')
  await app.service(emailPath).create(email)
}

async function generateSMS({
  app,
  result,
  mobile,
  inviteType,
  inviterUsername,
  targetObjectId
}: {
  app: Application
  result: InviteType
  mobile: string
  inviteType: string
  inviterUsername: string
  targetObjectId?: string
}): Promise<void> {
  if (config.testEnabled) {
    return
  }

  let channelName, locationName
  const hashLink = getInviteLink(inviteType, result.id, result.passcode!)

  if (inviteType === 'channel') {
    const channel = await app.service(channelPath).get(targetObjectId! as ChannelID)
    channelName = channel.name
  }

  if (inviteType === 'location') {
    const location = await app.service(locationPath).get(targetObjectId!)
    locationName = location.name
  }

  if (inviteType === 'instance') {
    const instance = await app.service(instancePath).get(targetObjectId!)
    locationName = instance.location.name
  }
  const templatePath = path.join(emailAccountTemplatesPath, `magiclink-sms-invite-${inviteType}.pug`)
  const compiledHTML = pug
    .compileFile(templatePath)({
      title: config.client.title,
      inviterUsername: inviterUsername,
      channelName: channelName,
      locationName: locationName,
      hashLink
    })
    .replace(/&amp;/g, '&') // Text message links can't have HTML escaped ampersands.

  const sms: SmsData = {
    mobile,
    text: compiledHTML
  }

  await app
    .service(smsPath)
    .create(sms, null!)
    .then(() => logger.info('Sent SMS'))
    .catch((err: any) => logger.error(err, `Error sending SMS: ${err.message}`))
}

// This will attach the owner ID in the contact while creating/updating list item
export const sendInvite = async (context: HookContext) => {
  const { app, result, params } = context
  try {
    let token = ''
    if (result.identityProviderType === 'email' || (result.identityProviderType === 'sms' && result.token)) {
      token = result.token as string
    } else {
      token = result.inviteeId as string
    }
    const inviteType = result.inviteType
    const targetObjectId = result.targetObjectId

    const authUser = params.user as UserType

    if (result.identityProviderType === 'email') {
      await generateEmail({
        app,
        result,
        toEmail: token,
        inviteType,
        inviterUsername: authUser.name,
        targetObjectId
      })
    } else if (result.identityProviderType === 'sms') {
      await generateSMS({
        app,
        result,
        mobile: token,
        inviteType,
        inviterUsername: authUser.name,
        targetObjectId
      })
    } else if (result.inviteeId != null) {
      if (inviteType === 'friend') {
        const existingRelationshipStatus = await app.service(userRelationshipPath).find({
          query: {
            $or: [
              {
                userRelationshipType: 'friend'
              },
              {
                userRelationshipType: 'requested'
              }
            ],
            userId: result.userId,
            relatedUserId: result.inviteeId as UserID
          }
        })
        if (existingRelationshipStatus.total === 0) {
          await app.service(userRelationshipPath).create(
            {
              userRelationshipType: 'requested',
              userId: result.userId,
              relatedUserId: result.inviteeId as UserID
            },
            {}
          )
        }
      }

      const emailIdentityProviderResult = (await app.service(identityProviderPath).find({
        query: {
          userId: result.inviteeId as UserID,
          type: 'email'
        }
      })) as Paginated<IdentityProviderType>

      if (emailIdentityProviderResult.total > 0) {
        await generateEmail({
          app,
          result,
          toEmail: emailIdentityProviderResult.data[0].token,
          inviteType,
          inviterUsername: authUser.name,
          targetObjectId
        })
      } else {
        const SMSIdentityProviderResult = (await app.service(identityProviderPath).find({
          query: {
            userId: result.inviteeId as UserID,
            type: 'sms'
          }
        })) as Paginated<IdentityProviderType>

        if (SMSIdentityProviderResult.total > 0) {
          await generateSMS({
            app,
            result,
            mobile: SMSIdentityProviderResult.data[0].token,
            inviteType,
            inviterUsername: authUser.name,
            targetObjectId
          })
        }
      }
    }
  } catch (err) {
    logger.error(err)
    return null!
  }
}
