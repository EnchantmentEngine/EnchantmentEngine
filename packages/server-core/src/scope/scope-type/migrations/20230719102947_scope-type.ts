import type { Knex } from 'knex'

import { scopeTypePath } from '@ir-engine/common/src/schemas/scope/scope-type.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'scopeType'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, scopeTypePath)
  }

  const tableExists = await knex.schema.hasTable(scopeTypePath)

  if (tableExists === false) {
    await knex.schema.createTable(scopeTypePath, (table) => {
      //@ts-ignore
      table.string('type', 255).notNullable().unique().primary()

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

  const tableExists = await knex.schema.hasTable(scopeTypePath)

  if (tableExists === true) {
    await knex.schema.dropTable(scopeTypePath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
