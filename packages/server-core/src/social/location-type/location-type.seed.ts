import { Knex } from 'knex'

import { locationTypePath, LocationTypeType } from '@ir-engine/common/src/schemas/social/location-type.schema'
import appConfig from '@ir-engine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: LocationTypeType[] = await Promise.all([
    { type: 'private' },
    { type: 'public' }, // parse metadata for video staticResourceType (eg 360-eac)
    { type: 'showroom' }
  ])

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(locationTypePath).del()

    // Inserts seed entries
    await knex(locationTypePath).insert(seedData)
  } else {
    const existingData = await knex(locationTypePath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(locationTypePath).insert(item)
      }
    }
  }
}
