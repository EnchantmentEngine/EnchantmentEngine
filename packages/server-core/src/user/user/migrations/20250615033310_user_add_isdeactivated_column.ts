import type { Knex } from 'knex'

import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const isDeactivatedColumnExists = await knex.schema.hasColumn(userPath, 'isDeactivated')
  const deactivatedAtColumnExists = await knex.schema.hasColumn(userPath, 'deactivatedAt')

  if (isDeactivatedColumnExists === false) {
    await knex.schema.alterTable(userPath, async (table) => {
      table.boolean('isDeactivated').defaultTo(false)
    })
    await knex(userPath).update({ isDeactivated: false })
  }

  if (deactivatedAtColumnExists === false) {
    await knex.schema.alterTable(userPath, async (table) => {
      table.dateTime('deactivatedAt').nullable()
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

  const isDeactivatedColumnExists = await knex.schema.hasColumn(userPath, 'isDeactivated')
  const deactivatedAtColumnExists = await knex.schema.hasColumn(userPath, 'deactivatedAt')

  if (isDeactivatedColumnExists === true) {
    await knex.schema.alterTable(userPath, async (table) => {
      table.dropColumn('isDeactivated')
    })
  }

  if (deactivatedAtColumnExists === true) {
    await knex.schema.alterTable(userPath, async (table) => {
      table.dropColumn('deactivatedAt')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
