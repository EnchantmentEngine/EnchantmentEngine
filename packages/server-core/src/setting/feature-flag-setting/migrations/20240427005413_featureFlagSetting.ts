import { featureFlagSettingPath } from '@ir-engine/common/src/schemas/setting/feature-flag-setting.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(featureFlagSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(featureFlagSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('flagName').notNullable()
      table.boolean('flagValue').notNullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
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

  const tableExists = await knex.schema.hasTable(featureFlagSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(featureFlagSettingPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
