import type { Knex } from 'knex'

import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'identity_provider'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(identityProviderPath)

  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(identityProviderPath)
    await knex.schema.renameTable(oldTableName, identityProviderPath)
  }

  tableExists = await knex.schema.hasTable(identityProviderPath)

  if (tableExists === false) {
    await knex.schema.createTable(identityProviderPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.string('token', 255).collate('utf8mb4_bin').defaultTo(null).unique()
      table.string('accountIdentifier', 255).defaultTo(null)
      table.string('email', 255).defaultTo(null)
      table.string('oauthToken', 255).defaultTo(null)
      table.string('oauthRefreshToken', 255).defaultTo(null)
      table.string('type', 255).notNullable()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').defaultTo(null).index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      // unique combinations
      table.unique(['userId', 'token'], { indexName: 'identity_provider_user_id_token' })

      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(identityProviderPath)

  if (tableExists === true) {
    await knex.schema.dropTable(identityProviderPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
