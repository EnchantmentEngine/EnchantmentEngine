import type { Knex } from 'knex'

import { projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(projectPath)

  if (tableExists === true) {
    await knex.schema.alterTable(projectPath, (table) => {
      table.unique(['name'])
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

  const tableExists = await knex.schema.hasTable(projectPath)

  if (tableExists === true) {
    try {
      await knex.schema.alterTable(projectPath, (table) => {
        table.dropUnique(['name'])
      })
    } catch (err) {
      //If the index doesn't exist for some reason, just ignore error
    }
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
