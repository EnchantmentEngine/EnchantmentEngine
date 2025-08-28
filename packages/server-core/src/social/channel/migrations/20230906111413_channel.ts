import type { Knex } from 'knex'

import { channelPath } from '@ir-engine/common/src/schemas/social/channel.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(channelPath)

  if (tableExists === false) {
    // Added transaction here in order to ensure both below queries run on same pool.
    // https://github.com/knex/knex/issues/218#issuecomment-56686210

    await knex.raw('SET FOREIGN_KEY_CHECKS=0')

    await knex.schema.createTable(channelPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('name', 255).nullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
      //@ts-ignore
      table.uuid('instanceId').collate('utf8mb4_bin').nullable()

      // Foreign keys
      table.foreign('instanceId').references('id').inTable('instance').onDelete('SET NULL').onUpdate('CASCADE')
    })

    await knex.raw('SET FOREIGN_KEY_CHECKS=1')
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(channelPath)

  if (tableExists === true) {
    await knex.schema.dropTable(channelPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
