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
  const taskServerSettingPath = 'coil-setting'

  const tableExists = await knex.schema.hasTable(taskServerSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(taskServerSettingPath).first()

    if (recordExists) {
      const taskServerSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.Coil.PaymentPointer,
            value: process.env.COIL_PAYMENT_POINTER || ''
          },
          {
            key: EngineSettings.Coil.ClientId,
            value: process.env.COIL_API_CLIENT_ID || ''
          },
          {
            key: EngineSettings.Coil.ClientSecret,
            value: process.env.COIL_API_CLIENT_SECRET || ''
          }
        ].map(async (item) => ({
          ...item,
          dataType: getDataType(item.value),
          id: uuidv4(),
          type: 'private' as EngineSettingType['type'],
          category: 'coil' as EngineSettingType['category'],
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )
      await knex.from(engineSettingPath).insert(taskServerSettings)
    }
  }

  await knex.schema.dropTableIfExists(taskServerSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
