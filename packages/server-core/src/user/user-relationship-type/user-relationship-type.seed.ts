import { Knex } from 'knex'

import {
  userRelationshipTypePath,
  userRelationshipTypes,
  UserRelationshipTypeType
} from '@ir-engine/common/src/schemas/user/user-relationship-type.schema'
import appConfig from '@ir-engine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: UserRelationshipTypeType[] = userRelationshipTypes.map((type) => ({ type }))

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(userRelationshipTypePath).del()

    // Inserts seed entries
    await knex(userRelationshipTypePath).insert(seedData)
  } else {
    const existingData = await knex(userRelationshipTypePath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(userRelationshipTypePath).insert(item)
      }
    }
  }
}
