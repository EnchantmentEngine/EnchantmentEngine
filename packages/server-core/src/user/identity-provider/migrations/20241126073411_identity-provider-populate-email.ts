import { identityProviderPath } from '@ir-engine/common/src/schema.type.module'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await knex(identityProviderPath)
    .where({ type: 'email' })
    .andWhere('email', null)
    .update({
      email: knex.raw('accountIdentifier')
    })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
