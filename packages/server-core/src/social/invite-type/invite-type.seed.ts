import { Knex } from 'knex'

import { inviteTypePath, inviteTypes, InviteTypeType } from '@ir-engine/common/src/schemas/social/invite-type.schema'
import appConfig from '@ir-engine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: InviteTypeType[] = inviteTypes.map((type) => ({ type }))

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(inviteTypePath).del()

    // Inserts seed entries
    await knex(inviteTypePath).insert(seedData)
  } else {
    const existingData = await knex(inviteTypePath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(inviteTypePath).insert(item)
      }
    }
  }
}
