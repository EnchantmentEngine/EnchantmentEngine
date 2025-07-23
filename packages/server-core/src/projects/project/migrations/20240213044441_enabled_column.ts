import type { Knex } from 'knex'

import { projectPath } from '@ir-engine/common/src/schema.type.module'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const enabledColumnExists = await knex.schema.hasColumn(projectPath, 'enabled')
  if (!enabledColumnExists) {
    await knex.schema.alterTable(projectPath, async (table) => {
      table.boolean('enabled').defaultTo(true)
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const enabledColumnExists = await knex.schema.hasColumn(projectPath, 'enabled')

  if (enabledColumnExists) {
    await knex.schema.alterTable(projectPath, async (table) => {
      table.dropColumn('enabled')
    })
  }
}
