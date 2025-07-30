import type { Knex } from 'knex'

import { projectPath } from '@ir-engine/common/src/schema.type.module'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const visibilityColumnExists = await knex.schema.hasColumn(projectPath, 'visibility')
  if (!visibilityColumnExists) {
    await knex.schema.alterTable(projectPath, async (table) => {
      table.string('visibility', 255).defaultTo('private')
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const visibilityColumnExists = await knex.schema.hasColumn(projectPath, 'visibility')

  if (visibilityColumnExists) {
    await knex.schema.alterTable(projectPath, async (table) => {
      table.dropColumn('visibility')
    })
  }
}
