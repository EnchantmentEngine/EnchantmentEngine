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
  const metabaseSettingPath = 'metabase-setting'

  const tableExists = await knex.schema.hasTable(metabaseSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(metabaseSettingPath).first()
    if (recordExists) {
      const metabaseSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.Metabase.SiteUrl,
            value: recordExists.siteUrl || process.env.METABASE_SITE_URL || ''
          },
          {
            key: EngineSettings.Metabase.SecretKey,
            value: recordExists.secretKey || process.env.METABASE_SECRET_KEY || ''
          },
          {
            key: EngineSettings.Metabase.CrashDashboardId,
            value: recordExists.crashDashboardId || process.env.METABASE_CRASH_DASHBOARD_ID || ''
          },
          {
            key: EngineSettings.Metabase.Expiration,
            value: recordExists.expiration || process.env.METABASE_EXPIRATION || ''
          },
          {
            key: EngineSettings.Metabase.Environment,
            value: recordExists.environment || process.env.METABASE_ENVIRONMENT || ''
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          dataType: getDataType(item.value),
          type: 'private' as EngineSettingType['type'],
          category: 'metabase' as EngineSettingType['category'],
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )
      await knex.from(engineSettingPath).insert(metabaseSettings)
    }
  }

  await knex.schema.dropTableIfExists(metabaseSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
