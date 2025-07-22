import type { Knex } from 'knex'

import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const avatarIdColumnExists = await knex.schema.hasColumn(userPath, 'avatarId')

  if (avatarIdColumnExists === true) {
    try {
      await knex.schema.alterTable(userPath, async (table) => {
        table.dropForeign('avatarId')
      })
    } catch (err) {
      //If the foreign key doesn't exist, then move on
    }
    await knex.schema.alterTable(userPath, async (table) => {
      table.dropColumn('avatarId')
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

  const avatarIdColumnExists = await knex.schema.hasColumn(userPath, 'avatarId')

  if (avatarIdColumnExists === false) {
    await knex.schema.alterTable(userPath, async (table) => {
      //@ts-ignore
      table.uuid('avatarId').collate('utf8mb4_bin').nullable().index()
      table.foreign('avatarId').references('id').inTable('avatar').onDelete('SET NULL').onUpdate('CASCADE')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
