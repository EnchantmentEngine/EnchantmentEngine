import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { RouteID, routePath, RouteType } from '@ir-engine/common/src/schemas/route/route.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import appConfig from '@ir-engine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: RouteType[] = await Promise.all(
    [
      {
        project: 'EnchantmentEngine/default-project',
        route: '/'
      },
      {
        project: 'EnchantmentEngine/default-project',
        route: '/location'
      },
      {
        project: 'EnchantmentEngine/default-project',
        route: '/admin'
      },
      {
        project: 'EnchantmentEngine/default-project',
        route: '/studio'
      },
      {
        project: 'EnchantmentEngine/default-project',
        route: '/studio-old'
      },
      {
        project: 'EnchantmentEngine/default-project',
        route: '/capture'
      },
      {
        project: 'EnchantmentEngine/default-project',
        route: '/chat'
      }
    ].map(async (item) => ({
      ...item,
      id: uuidv4() as RouteID,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(routePath).del()

    // Inserts seed entries
    await knex(routePath).insert(seedData)
  } else {
    const existingData = await knex(routePath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(routePath).insert(item)
      }
    }
  }
}
