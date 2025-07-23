import type { Knex } from 'knex'

import { loginTokenPath } from '@ir-engine/common/src/schemas/user/login-token.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const associateUserColumnExists = await knex.schema.hasColumn(loginTokenPath, 'associateUserId')
  if (!associateUserColumnExists) {
    await knex.schema.alterTable(loginTokenPath, async (table) => {
      //@ts-ignore
      table.uuid('associateUserId').collate('utf8mb4_bin').nullable().index()
      table.foreign('associateUserId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const associateUserColumnExists = await knex.schema.hasColumn(loginTokenPath, 'associateUserId')

  if (associateUserColumnExists) {
    await knex.schema.alterTable(loginTokenPath, async (table) => {
      table.dropColumn('associateUserId')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
