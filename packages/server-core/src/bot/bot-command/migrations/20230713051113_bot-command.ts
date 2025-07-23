import type { Knex } from 'knex'

import { botCommandPath } from '@ir-engine/common/src/schemas/bot/bot-command.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'botCommand'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(botCommandPath)
  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(botCommandPath)
    await knex.schema.renameTable(oldTableName, botCommandPath)
  }

  tableExists = await knex.schema.hasTable(botCommandPath)

  if (!tableExists && !oldNamedTableExists) {
    await knex.schema.createTable(botCommandPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('name', 255).notNullable().unique()
      table.string('description', 255).nullable()
      //@ts-ignore
      table.uuid('botId').collate('utf8mb4_bin').nullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('botId').references('id').inTable('bot').onDelete('SET NULL').onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(botCommandPath)

  if (tableExists === true) {
    await knex.schema.dropTable(botCommandPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
