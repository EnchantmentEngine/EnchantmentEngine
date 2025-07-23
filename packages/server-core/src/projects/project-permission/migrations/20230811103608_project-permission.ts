import type { Knex } from 'knex'

import { projectPermissionPath } from '@ir-engine/common/src/schemas/projects/project-permission.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'project_permission'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(projectPermissionPath)
  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(projectPermissionPath)
    await knex.schema.renameTable(oldTableName, projectPermissionPath)
  }

  tableExists = await knex.schema.hasTable(projectPermissionPath)

  if (tableExists) {
    const hasIdColum = await knex.schema.hasColumn(projectPermissionPath, 'id')
    const hasProjectIdColumn = await knex.schema.hasColumn(projectPermissionPath, 'projectId')
    const hasUserIdColumn = await knex.schema.hasColumn(projectPermissionPath, 'userId')
    if (!(hasIdColum && hasProjectIdColumn && hasUserIdColumn)) {
      await knex.schema.dropTable(projectPermissionPath)
      tableExists = false
    }
  }

  if (!tableExists && !oldNamedTableExists) {
    await knex.schema.createTable(projectPermissionPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('projectId').collate('utf8mb4_bin').defaultTo(null).index()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').defaultTo(null).index()
      table.string('type', 255).defaultTo(null).index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('projectId').references('id').inTable('project').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table
        .foreign('type')
        .references('type')
        .inTable('project-permission-type')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(projectPermissionPath)

  if (tableExists === true) {
    await knex.schema.dropTable(projectPermissionPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
