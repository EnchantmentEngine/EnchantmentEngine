import type { Knex } from 'knex'

import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await knex.schema.alterTable(identityProviderPath, (table) => {
    table.string('oauthRefreshToken', 255).defaultTo(null)
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const oauthRefreshTokenColumnExists = await knex.schema.hasColumn(identityProviderPath, 'oauthRefreshToken')

  if (oauthRefreshTokenColumnExists) {
    await knex.schema.alterTable(identityProviderPath, async (table) => {
      table.dropColumn('oauthRefreshToken')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
