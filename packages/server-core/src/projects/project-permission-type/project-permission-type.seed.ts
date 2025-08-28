import { Knex } from 'knex'

import {
  projectPermissionTypePath,
  ProjectPermissionTypeType
} from '@ir-engine/common/src/schemas/projects/project-permission-type.schema'
import appConfig from '@ir-engine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: ProjectPermissionTypeType[] = await Promise.all([{ type: 'owner' }, { type: 'editor' }])

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(projectPermissionTypePath).del()

    // Inserts seed entries
    await knex(projectPermissionTypePath).insert(seedData)
  } else {
    const existingData = await knex(projectPermissionTypePath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(projectPermissionTypePath).insert(item)
      }
    }
  }
}
