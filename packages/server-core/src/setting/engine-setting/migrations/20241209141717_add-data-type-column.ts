import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const dataTypeColumnExists = await knex.schema.hasColumn(engineSettingPath, 'dataType')

  if (!dataTypeColumnExists) {
    await knex.schema.alterTable(engineSettingPath, (table) => {
      table.string('dataType', 10).defaultTo('string')
    })

    const engineSettings = await knex(engineSettingPath).select('id', 'value')
    const engineSettingDataTypeUpdates = engineSettings.map((setting) => {
      // update setting value to boolean if it is '0' or '1'
      if (setting.value == '0' || setting.value == '1') {
        return knex(engineSettingPath)
          .where('id', setting.id)
          .update('dataType', 'boolean')
          .update('value', setting.value === '1' ? 'true' : 'false')
      }
      const dataType = getDataType(setting.value)
      return knex(engineSettingPath).where('id', setting.id).update('dataType', dataType)
    })
    await Promise.all(engineSettingDataTypeUpdates)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const dataTypeColumnExists = await knex.schema.hasColumn(engineSettingPath, 'dataType')

  if (dataTypeColumnExists) {
    await knex.schema.alterTable(engineSettingPath, async (table) => {
      table.dropColumn('dataType')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
