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
  const taskServerSettingPath = 'task-server-setting'

  const tableExists = await knex.schema.hasTable(taskServerSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(taskServerSettingPath).first()

    if (recordExists) {
      const taskServerSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.TaskServer.Port,
            value: recordExists.port || process.env.TASKSERVER_PORT || '3030'
          },
          {
            key: EngineSettings.TaskServer.ProcessInterval,
            value: recordExists.processInterval || process.env.TASKSERVER_PROCESS_INTERVAL_SECONDS || '30'
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          dataType: getDataType(item.value),
          type: 'private' as EngineSettingType['type'],
          category: 'task-server' as EngineSettingType['category'],
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
