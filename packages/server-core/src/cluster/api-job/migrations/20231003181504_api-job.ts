import type { Knex } from 'knex'

import { apiJobPath } from '@ir-engine/common/src/schemas/cluster/api-job.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(apiJobPath)

  if (tableExists === false) {
    await knex.schema.createTable(apiJobPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('status', 255).defaultTo('pending')
      table.text('returnData', 'mediumtext')
      table.dateTime('startTime')
      table.dateTime('endTime')
      table.string('name', 255)
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

  const tableExists = await knex.schema.hasTable(apiJobPath)

  if (tableExists === true) {
    await knex.schema.dropTable(apiJobPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
