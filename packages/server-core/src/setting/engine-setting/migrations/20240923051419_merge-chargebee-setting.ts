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
  const mergeChargebeeSettingPath = 'chargebee-setting'

  const tableExists = await knex.schema.hasTable(mergeChargebeeSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(mergeChargebeeSettingPath).first()

    if (recordExists) {
      const taskServerSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.Chargebee.Url,
            value: recordExists.url || process.env.CHARGEBEE_SITE + '.chargebee.com' || 'dummy.not-chargebee.com'
          },
          {
            key: EngineSettings.Chargebee.ApiKey,
            value: recordExists.apiKey || process.env.CHARGEBEE_API_KEY || ''
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          dataType: getDataType(item.value),
          type: 'private' as EngineSettingType['type'],
          category: 'chargebee' as EngineSettingType['category'],
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )
      await knex.from(engineSettingPath).insert(taskServerSettings)
    }
  }

  await knex.schema.dropTableIfExists(mergeChargebeeSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
