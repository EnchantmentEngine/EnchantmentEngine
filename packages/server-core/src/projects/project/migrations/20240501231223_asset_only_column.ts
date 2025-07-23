import type { Knex } from 'knex'

import { projectPath } from '@ir-engine/common/src/schema.type.module'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const assetsOnlyColumnExists = await knex.schema.hasColumn(projectPath, 'assetsOnly')
  if (!assetsOnlyColumnExists) {
    await knex.schema.alterTable(projectPath, async (table) => {
      table.boolean('assetsOnly').defaultTo(false)
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const assetsOnlyColumnExists = await knex.schema.hasColumn(projectPath, 'assetsOnly')

  if (assetsOnlyColumnExists) {
    await knex.schema.alterTable(projectPath, async (table) => {
      table.dropColumn('assetsOnly')
    })
  }
}
