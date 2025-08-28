import type { Knex } from 'knex'

import { messagePath } from '@ir-engine/common/src/schemas/social/message.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(messagePath)

  if (tableExists === false) {
    await knex.schema.createTable(messagePath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('text', 1023).notNullable()
      table.boolean('isNotification').notNullable().defaultTo(false)
      //@ts-ignore
      table.uuid('channelId', 36).collate('utf8mb4_bin').defaultTo(null).index()
      //@ts-ignore
      table.uuid('senderId', 36).collate('utf8mb4_bin').defaultTo(null).index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('channelId').references('id').inTable('channel').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('senderId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(messagePath)

  if (tableExists === true) {
    await knex.schema.dropTable(messagePath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
