import { Knex } from 'knex'

import { scopeTypePath, ScopeTypeType } from '@ir-engine/common/src/schemas/scope/scope-type.schema'
import { ScopeType } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import appConfig from '@ir-engine/server-core/src/appconfig'

export const scopeTypeSeed = [
  {
    type: 'admin:admin' as ScopeType
  },
  {
    type: 'routes:read' as ScopeType
  },
  {
    type: 'routes:write' as ScopeType
  },
  {
    type: 'location:read' as ScopeType
  },
  {
    type: 'location:write' as ScopeType
  },
  {
    type: 'static_resource:read' as ScopeType
  },
  {
    type: 'static_resource:write' as ScopeType
  },
  {
    type: 'editor:write' as ScopeType
  },
  {
    type: 'bot:read' as ScopeType
  },
  {
    type: 'bot:write' as ScopeType
  },
  {
    type: 'globalAvatars:read' as ScopeType
  },
  {
    type: 'globalAvatars:write' as ScopeType
  },
  {
    type: 'benchmarking:read' as ScopeType
  },
  {
    type: 'benchmarking:write' as ScopeType
  },
  {
    type: 'instance:read' as ScopeType
  },
  {
    type: 'instance:write' as ScopeType
  },
  {
    type: 'invite:read' as ScopeType
  },
  {
    type: 'invite:write' as ScopeType
  },
  {
    type: 'channel:read' as ScopeType
  },
  {
    type: 'channel:write' as ScopeType
  },
  {
    type: 'user:read' as ScopeType
  },
  {
    type: 'user:write' as ScopeType
  },
  {
    type: 'scene:read' as ScopeType
  },
  {
    type: 'scene:write' as ScopeType
  },
  {
    type: 'projects:read' as ScopeType
  },
  {
    type: 'projects:write' as ScopeType
  },
  {
    type: 'settings:read' as ScopeType
  },
  {
    type: 'settings:write' as ScopeType
  },
  {
    type: 'server:read' as ScopeType
  },
  {
    type: 'server:write' as ScopeType
  },
  {
    type: 'recording:read' as ScopeType
  },
  {
    type: 'recording:write' as ScopeType
  },
  {
    type: 'moderation:read' as ScopeType
  },
  {
    type: 'moderation:write' as ScopeType
  }
]

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: ScopeTypeType[] = await Promise.all(
    scopeTypeSeed.map(async (item) => ({
      ...item,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(scopeTypePath).del()

    // Inserts seed entries
    await knex(scopeTypePath).insert(seedData)
  } else {
    const existingData = await knex(scopeTypePath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(scopeTypePath).insert(item)
      }
    }
  }
}
