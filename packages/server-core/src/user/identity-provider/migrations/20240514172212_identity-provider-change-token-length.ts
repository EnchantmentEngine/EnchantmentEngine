import type { Knex } from 'knex'

import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await knex.schema.alterTable(identityProviderPath, (table) => {
    table.string('token', 255).defaultTo(null).alter()
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await knex.schema.alterTable(identityProviderPath, (table) => {
    table.uuid('token').defaultTo(null).alter()
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
