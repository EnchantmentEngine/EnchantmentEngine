import type { Knex } from 'knex'

import { buildStatusPath } from '@ir-engine/common/src/schemas/cluster/build-status.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'build_status'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, buildStatusPath)
  }

  const tableExists = await knex.schema.hasTable(buildStatusPath)

  if (tableExists === false) {
    await knex.schema.createTable(buildStatusPath, (table) => {
      table.increments('id').primary()
      table.string('status', 255).defaultTo('pending')
      table.text('logs', 'mediumtext')
      table.dateTime('dateStarted')
      table.dateTime('dateEnded')
      table.string('commitSHA', 255)
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(buildStatusPath)

  if (tableExists === true) {
    await knex.schema.dropTable(buildStatusPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
