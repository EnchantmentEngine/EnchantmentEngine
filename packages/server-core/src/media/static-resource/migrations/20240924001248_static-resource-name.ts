import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import type { Knex } from 'knex'

const assetPath = 'asset'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const nameColumnExists = await knex.schema.hasColumn(staticResourcePath, 'name')
  if (!nameColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('name', 255).nullable().defaultTo(null)
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const nameColumnExists = await knex.schema.hasColumn(staticResourcePath, 'name')
  if (nameColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('name')
    })
  }
}
