import { Knex } from 'knex'

import { locationSettingPath, LocationSettingType } from '@ir-engine/common/src/schemas/social/location-setting.schema'
import { LocationID } from '@ir-engine/common/src/schemas/social/location.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import appConfig from '@ir-engine/server-core/src/appconfig'

export const locationSettingSeedData = [
  {
    id: '37ce32f0-208d-11eb-b02f-37cfdadfe58b',
    locationId: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d60' as LocationID,
    locationType: 'public' as const,
    videoEnabled: true,
    audioEnabled: true,
    screenSharingEnabled: true,
    faceStreamingEnabled: true
    /** @todo: Re-enable this when the engine has a working jump control/vr capabilities */
    // jumpControlEnabled: true,
    // vrEnabled: true
  },
  {
    id: '37ce32f0-208d-11eb-b02f-37cfdadfe58d',
    locationId: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d62' as LocationID,
    locationType: 'public' as const,
    videoEnabled: true,
    audioEnabled: true,
    screenSharingEnabled: true,
    faceStreamingEnabled: true
    /** @todo: Re-enable this when the engine has a working jump control/vr capabilities */
    // jumpControlEnabled: true,
    // vrEnabled: true
  },
  {
    id: '37ce32f0-208d-11eb-b02f-37cfdadfe58e',
    locationId: '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d63' as LocationID,
    locationType: 'public' as const,
    videoEnabled: true,
    audioEnabled: true,
    screenSharingEnabled: true,
    /** @todo: Re-enable this when the engine has a working jump control/vr capabilities */
    faceStreamingEnabled: true
    // jumpControlEnabled: true,
    // vrEnabled: true
  }
]

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: LocationSettingType[] = await Promise.all(
    locationSettingSeedData.map(async (item) => ({
      ...item,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(locationSettingPath).del()

    // Inserts seed entries
    await knex(locationSettingPath).insert(seedData)
  } else {
    const existingData = await knex(locationSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(locationSettingPath).insert(item)
      }
    }
  }
  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
