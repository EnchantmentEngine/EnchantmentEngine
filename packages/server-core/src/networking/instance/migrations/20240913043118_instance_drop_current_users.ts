import type { Knex } from 'knex'

const instanceTableName = 'instance'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const projectColumnExists = await knex.schema.hasColumn(instanceTableName, 'currentUsers')

  if (projectColumnExists === true) {
    await knex.schema.alterTable(instanceTableName, async (table) => {
      table.dropColumn('currentUsers')
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

  const projectColumnExists = await knex.schema.hasColumn(instanceTableName, 'currentUsers')

  if (projectColumnExists === false) {
    await knex.schema.alterTable(instanceTableName, async (table) => {
      table.integer('currentUsers', 11).defaultTo(0)
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
