import type { Knex } from 'knex'

import { matchUserPath } from '@ir-engine/common/src/schemas/matchmaking/match-user.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'match_user'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, matchUserPath)

    const oldGameModeColumnExists = await knex.schema.hasColumn(matchUserPath, 'gamemode')
    if (oldGameModeColumnExists) {
      await knex.schema.alterTable(matchUserPath, async (table) => {
        table.renameColumn('gamemode', 'gameMode')
      })
    }
  }

  const tableExists = await knex.schema.hasTable(matchUserPath)

  if (tableExists === false) {
    // Added transaction here in order to ensure both below queries run on same pool.
    // https://github.com/knex/knex/issues/218#issuecomment-56686210

    await knex.raw('SET FOREIGN_KEY_CHECKS=0')

    await knex.schema.createTable(matchUserPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('ticketId').collate('utf8mb4_bin').nullable()
      table.string('gameMode', 255).nullable()
      table.string('connection', 255).nullable()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').nullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    })

    await knex.raw('SET FOREIGN_KEY_CHECKS=1')
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(matchUserPath)

  if (tableExists === true) {
    await knex.schema.dropTable(matchUserPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
