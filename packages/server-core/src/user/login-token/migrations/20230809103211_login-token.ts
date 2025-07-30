import type { Knex } from 'knex'

import { loginTokenPath } from '@ir-engine/common/src/schemas/user/login-token.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'login_token'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(loginTokenPath)
  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(loginTokenPath)
    await knex.schema.renameTable(oldTableName, loginTokenPath)
  }

  tableExists = await knex.schema.hasTable(loginTokenPath)

  if (!tableExists && !oldNamedTableExists) {
    await knex.schema.createTable(loginTokenPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('token', 255).defaultTo(null)
      //@ts-ignore
      table.uuid('identityProviderId', 36).collate('utf8mb4_bin').defaultTo(null).index()
      table.dateTime('expiresAt').defaultTo(null)
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table
        .foreign('identityProviderId')
        .references('id')
        .inTable('identity-provider')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(loginTokenPath)

  if (tableExists === true) {
    await knex.schema.dropTable(loginTokenPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
