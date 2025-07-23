import type { Knex } from 'knex'

import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await knex.schema.alterTable(identityProviderPath, (table) => {
    table.string('email', 255).defaultTo(null)
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const emailColumnExists = await knex.schema.hasColumn(identityProviderPath, 'email')

  if (emailColumnExists) {
    await knex.schema.alterTable(identityProviderPath, async (table) => {
      table.dropColumn('email')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
