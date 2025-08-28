import { projectPermissionPath } from '@ir-engine/common/src/schemas/projects/project-permission.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await addCreatedByColumn(knex, projectPermissionPath)

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await dropCreatedByColumn(knex, projectPermissionPath)

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

export async function addCreatedByColumn(knex: Knex, tableName: string) {
  const createdByColumnExists = await knex.schema.hasColumn(tableName, 'createdBy')

  if (createdByColumnExists === false) {
    await knex.schema.alterTable(tableName, async (table) => {
      //@ts-ignore
      table.uuid('createdBy', 36).collate('utf8mb4_bin').nullable().index()
      table.foreign('createdBy').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
    })
  }
}

export async function dropCreatedByColumn(knex: Knex, tableName: string) {
  const createdByColumnExists = await knex.schema.hasColumn(tableName, 'createdBy')

  if (createdByColumnExists === true) {
    await knex.schema.alterTable(tableName, async (table) => {
      table.dropForeign('createdBy')
      table.dropColumn('createdBy')
    })
  }
}
