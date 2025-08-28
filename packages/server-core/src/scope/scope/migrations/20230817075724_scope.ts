import type { Knex } from 'knex'

import { scopePath } from '@ir-engine/common/src/schemas/scope/scope.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(scopePath)

  if (tableExists === false) {
    await knex.schema.createTable(scopePath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.string('userId', 36).collate('utf8mb4_bin').defaultTo(null).index()
      table.string('type', 255).defaultTo(null).index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('type').references('type').inTable('scope-type').onDelete('SET NULL').onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(scopePath)

  if (tableExists === true) {
    await knex.schema.dropTable(scopePath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
