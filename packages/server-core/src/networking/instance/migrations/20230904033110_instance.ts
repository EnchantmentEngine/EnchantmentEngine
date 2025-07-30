import type { Knex } from 'knex'

import { instancePath } from '@ir-engine/common/src/schemas/networking/instance.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(instancePath)

  if (tableExists === false) {
    await knex.schema.createTable(instancePath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('roomCode', 255).notNullable()
      table.string('ipAddress', 255).defaultTo(null)
      table.string('channelId', 255).defaultTo(null)
      table.string('podName', 255).defaultTo(null)
      table.integer('currentUsers', 11).defaultTo(0)
      table.boolean('ended').defaultTo(false)
      table.boolean('assigned').defaultTo(false)
      table.dateTime('assignedAt').defaultTo(null)
      //@ts-ignore
      table.uuid('locationId').collate('utf8mb4_bin').defaultTo(null).index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('locationId').references('id').inTable('location').onDelete('SET NULL').onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(instancePath)

  if (tableExists === true) {
    await knex.schema.dropTable(instancePath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
