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
  const helmSettingPath = 'helm-setting'

  const tableExists = await knex.schema.hasTable(helmSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(helmSettingPath).first()

    if (recordExists) {
      const redisSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.Helm.Main,
            value: recordExists.main || ''
          },
          {
            key: EngineSettings.Helm.Builder,
            value: recordExists.builder || ''
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          dataType: getDataType(item.value),
          type: 'private' as EngineSettingType['type'],
          category: 'helm',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )
      await knex.from(engineSettingPath).insert(redisSettings)
    }
  }

  await knex.schema.dropTableIfExists(helmSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
