import { engineSettingPath } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(engineSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(engineSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('key', 255).notNullable()
      table.string('value', 4095).notNullable()
      table.string('type', 255).notNullable().defaultTo('private')
      table.string('jsonKey', 255).defaultTo(null)
      table.string('dataType', 10).defaultTo('string')
      table.string('category', 255).notNullable()
      //@ts-ignore
      table.uuid('updatedBy', 36).collate('utf8mb4_bin').index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('updatedBy').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')

      table.unique(['key', 'category'])
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(engineSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(engineSettingPath)
  }
}
