import type { Knex } from 'knex'

import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const lastLoginColumnExists = await knex.schema.hasColumn(userPath, 'lastLogin')

  if (lastLoginColumnExists === true) {
    await knex.schema.alterTable(userPath, async (table) => {
      table.dropColumn('lastLogin')
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

  const lastLoginColumnExists = await knex.schema.hasColumn(userPath, 'lastLogin')

  if (lastLoginColumnExists === false) {
    await knex.schema.alterTable(userPath, async (table) => {
      table.dateTime('lastLogin').nullable()
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
