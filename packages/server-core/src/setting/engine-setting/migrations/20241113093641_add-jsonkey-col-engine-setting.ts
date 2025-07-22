import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await knex.schema.alterTable(engineSettingPath, (table) => {
    table.string('jsonKey', 255).defaultTo(null)
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const emailColumnExists = await knex.schema.hasColumn(engineSettingPath, 'jsonKey')

  if (emailColumnExists) {
    await knex.schema.alterTable(engineSettingPath, async (table) => {
      table.dropColumn('jsonKey')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
