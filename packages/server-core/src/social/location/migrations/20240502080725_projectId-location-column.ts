import { locationPath } from '@ir-engine/common/src/schemas/social/location.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await addProjectColumn(knex, locationPath)

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await dropProjectColumn(knex, locationPath)

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

export async function addProjectColumn(knex: Knex, tableName: string) {
  const projectColumnExists = await knex.schema.hasColumn(tableName, 'projectId')

  if (projectColumnExists === false) {
    await knex.schema.alterTable(tableName, async (table) => {
      //@ts-ignore
      table.uuid('projectId', 36).collate('utf8mb4_bin').nullable().index()
      table.foreign('projectId').references('id').inTable('project').onDelete('CASCADE').onUpdate('CASCADE')
    })
  }
}

export async function dropProjectColumn(knex: Knex, tableName: string) {
  const projectColumnExists = await knex.schema.hasColumn(tableName, 'projectId')

  if (projectColumnExists === true) {
    await knex.schema.alterTable(tableName, async (table) => {
      table.dropForeign('projectId')
      table.dropColumn('projectId')
    })
  }
}
