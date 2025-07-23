import { projectSettingPath } from '@ir-engine/common/src/schemas/setting/project-setting.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(projectSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(projectSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('key', 255).notNullable()
      table.string('value', 255).notNullable()
      table.string('type', 255).notNullable().defaultTo('private')
      //@ts-ignore
      table.uuid('projectId', 36).collate('utf8mb4_bin').index()
      //@ts-ignore
      table.uuid('userId', 36).collate('utf8mb4_bin').index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('projectId').references('id').inTable('project').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('userId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')

      table.unique(['projectId', 'key'])
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(projectSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(projectSettingPath)
  }
}
