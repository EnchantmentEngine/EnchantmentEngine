import type { Knex } from 'knex'

import { locationPath } from '@ir-engine/common/src/schemas/social/location.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  let tableExists = await knex.schema.hasTable(userPath)

  if (tableExists) {
    const hasIdColum = await knex.schema.hasColumn(userPath, 'id')
    if (!hasIdColum) {
      await knex.schema.dropTable(userPath)
      tableExists = false
    }
  }

  if (tableExists === false) {
    await knex.schema.createTable(userPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('name', 255).notNullable()
      table.boolean('isGuest').notNullable().defaultTo(true)
      table.string('inviteCode', 255).nullable().unique()
      table.string('did', 255).nullable()
      table.boolean('ageVerified').nullable().defaultTo(false)
      table.boolean('isDeactivated').defaultTo(false)
      table.dateTime('deactivatedAt').nullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
    })

    const updatedByLocationColumnExists = await knex.schema.hasColumn(locationPath, 'updatedBy')
    if (updatedByLocationColumnExists === false) {
      await knex.schema.alterTable(locationPath, async (table) => {
        //@ts-ignore
        table.uuid('updatedBy', 36).collate('utf8mb4_bin')
        table.foreign('updatedBy').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
      })
    }
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(userPath)

  if (tableExists === true) {
    await knex.schema.dropTable(userPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
