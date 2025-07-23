import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // Check if the MaxUsersPerInstance setting already exists in database
  const existingSettings = await knex
    .from(engineSettingPath)
    .whereIn('key', [EngineSettings.InstanceServer.MaxUsersPerInstance])
    .andWhere('category', 'instance-server')
    .select('key')

  // Create a map of existing settings for easy lookup
  const existingKeys = new Set(existingSettings.map((setting) => setting.key))

  // Prepare settings to insert
  const settingsToInsert: EngineSettingType[] = []

  if (!existingKeys.has(EngineSettings.InstanceServer.MaxUsersPerInstance)) {
    settingsToInsert.push({
      id: uuidv4(),
      key: EngineSettings.InstanceServer.MaxUsersPerInstance,
      value: process.env.INSTANCESERVER_MAX_USERS_PER_INSTANCE || '5',
      dataType: 'integer',
      type: 'public',
      category: 'instance-server',
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    })
  }

  // Insert all settings in a single operation if any need to be inserted
  if (settingsToInsert.length > 0) {
    await knex.from(engineSettingPath).insert(settingsToInsert)
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex
    .from(engineSettingPath)
    .whereIn('key', [EngineSettings.InstanceServer.MaxUsersPerInstance])
    .andWhere('category', 'instance-server')
    .delete()
}
