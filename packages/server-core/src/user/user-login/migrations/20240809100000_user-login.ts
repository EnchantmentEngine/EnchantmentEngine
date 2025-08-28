import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { userLoginPath } from '@ir-engine/common/src/schemas/user/user-login.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(userLoginPath)

  if (tableExists === false) {
    await knex.schema.createTable(userLoginPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').notNullable().index()
      table.string('userAgent', 255).notNullable()
      table.string('ipAddress', 255).notNullable()
      //@ts-ignore
      table.uuid('identityProviderId').collate('utf8mb4_bin').index()
      table.dateTime('createdAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table
        .foreign('identityProviderId')
        .references('id')
        .inTable(identityProviderPath)
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

  const tableExists = await knex.schema.hasTable(userLoginPath)

  if (tableExists === true) {
    await knex.schema.dropTable(userLoginPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
