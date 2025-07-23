import type { Knex } from 'knex'

import { projectPermissionTypePath } from '@ir-engine/common/src/schemas/projects/project-permission-type.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'project_permission_type'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, projectPermissionTypePath)
  }

  const tableExists = await knex.schema.hasTable(projectPermissionTypePath)

  if (tableExists === false) {
    await knex.schema.createTable(projectPermissionTypePath, (table) => {
      //@ts-ignore
      table.string('type', 255).notNullable().unique().primary()
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(projectPermissionTypePath)

  if (tableExists === true) {
    await knex.schema.dropTable(projectPermissionTypePath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
