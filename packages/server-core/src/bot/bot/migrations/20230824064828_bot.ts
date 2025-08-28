import type { Knex } from 'knex'

import { botPath } from '@ir-engine/common/src/schemas/bot/bot.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(botPath)

  if (tableExists === false) {
    await knex.schema.createTable(botPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('name', 255).notNullable()
      table.string('description', 255).defaultTo(null)
      //@ts-ignore
      table.uuid('instanceId', 36).collate('utf8mb4_bin').defaultTo(null).index()
      //@ts-ignore
      table.uuid('locationId', 36).collate('utf8mb4_bin').defaultTo(null).index()
      //@ts-ignore
      table.uuid('userId', 36).collate('utf8mb4_bin').defaultTo(null).index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('instanceId').references('id').inTable('instance').onDelete('SET NULL').onUpdate('CASCADE')
      table.foreign('locationId').references('id').inTable('location').onDelete('SET NULL').onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(botPath)

  if (tableExists === true) {
    await knex.schema.dropTable(botPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
