import type { Knex } from 'knex'

import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const acceptedTOSColumnExists = await knex.schema.hasColumn(userPath, 'acceptedTOS')

  if (acceptedTOSColumnExists) {
    await knex.schema.alterTable(userPath, async (table) => {
      table.renameColumn('acceptedTOS', 'ageVerified')
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

  const ageVerifiedColumnExists = await knex.schema.hasColumn(userPath, 'ageVerified')

  if (ageVerifiedColumnExists) {
    await knex.schema.alterTable(userPath, async (table) => {
      table.renameColumn('ageVerified', 'acceptedTOS')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
