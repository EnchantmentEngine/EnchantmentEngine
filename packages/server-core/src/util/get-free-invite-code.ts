import crypto from 'crypto'

import { InviteCode, userPath } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../declarations'

const getFreeInviteCode = async (app: Application): Promise<string> => {
  const code = crypto.randomBytes(4).toString('hex') as InviteCode
  const users = await app.service(userPath).find({
    query: {
      inviteCode: code
    },
    isInternal: true
  })
  return users.total === 0 ? code : await getFreeInviteCode(app)
}

export default getFreeInviteCode
