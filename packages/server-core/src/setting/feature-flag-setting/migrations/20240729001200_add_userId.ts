import { featureFlagSettingPath } from '@ir-engine/common/src/schemas/setting/feature-flag-setting.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const projectColumnExists = await knex.schema.hasColumn(featureFlagSettingPath, 'userId')

  if (projectColumnExists === false) {
    await knex.schema.alterTable(featureFlagSettingPath, async (table) => {
      //@ts-ignore
      table.uuid('userId', 36).collate('utf8mb4_bin').nullable().index()
      table.foreign('userId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const projectColumnExists = await knex.schema.hasColumn(featureFlagSettingPath, 'userId')

  if (projectColumnExists === true) {
    await knex.schema.alterTable(featureFlagSettingPath, async (table) => {
      table.dropForeign('userId')
      table.dropColumn('userId')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
