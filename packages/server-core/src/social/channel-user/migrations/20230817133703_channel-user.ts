import { Knex } from 'knex'

import { channelUserPath } from '@ir-engine/common/src/schemas/social/channel-user.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'channel_user'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(channelUserPath)

  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(channelUserPath)
    await knex.schema.renameTable(oldTableName, channelUserPath)
  }

  tableExists = await knex.schema.hasTable(channelUserPath)

  if (!tableExists && !oldNamedTableExists) {
    await knex.schema.createTable(channelUserPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.boolean('isOwner').notNullable().defaultTo(false)
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').defaultTo(null).index()
      //@ts-ignore
      table.uuid('channelId').collate('utf8mb4_bin').defaultTo(null).index()

      // Foreign keys
      table.foreign('channelId').references('id').inTable('channel').onUpdate('CASCADE').onDelete('CASCADE')
      table.foreign('userId').references('id').inTable('user').onUpdate('CASCADE').onDelete('SET NULL')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(channelUserPath)

  if (tableExists === true) {
    await knex.schema.dropTable(channelUserPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
