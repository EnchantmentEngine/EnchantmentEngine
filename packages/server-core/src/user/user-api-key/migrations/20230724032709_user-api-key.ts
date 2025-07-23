import type { Knex } from 'knex'

import { userApiKeyPath } from '@ir-engine/common/src/schemas/user/user-api-key.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'user_api_key'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, userApiKeyPath)
  }

  const tableExists = await knex.schema.hasTable(userApiKeyPath)

  if (tableExists === false) {
    // Added transaction here in order to ensure both below queries run on same pool.
    // https://github.com/knex/knex/issues/218#issuecomment-56686210

    await knex.raw('SET FOREIGN_KEY_CHECKS=0')

    await knex.schema.createTable(userApiKeyPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('token', 36).notNullable().unique()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').notNullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(userApiKeyPath)

  if (tableExists === true) {
    await knex.schema.dropTable(userApiKeyPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
