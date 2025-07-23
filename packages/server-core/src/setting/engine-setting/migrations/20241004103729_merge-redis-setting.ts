import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const redisSettingPath = 'redis-setting'

  const tableExists = await knex.schema.hasTable(redisSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(redisSettingPath).first()

    if (recordExists) {
      const redisSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.Redis.Address,
            value: recordExists.address || process.env.REDIS_ADDRESS || 'localhost'
          },
          {
            key: EngineSettings.Redis.Password,
            value: recordExists.password || process.env.REDIS_PASSWORD || ''
          },
          {
            key: EngineSettings.Redis.Port,
            value: recordExists.port || process.env.REDIS_PORT || '6379'
          },
          {
            key: EngineSettings.Redis.Enabled,
            value: recordExists.enabled || process.env.REDIS_ENABLED || ''
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          dataType: getDataType(item.value),
          type: 'private' as EngineSettingType['type'],
          category: 'redis' as EngineSettingType['category'],
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )
      await knex.from(engineSettingPath).insert(redisSettings)
    }
  }

  await knex.schema.dropTableIfExists(redisSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
