import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import type { Knex } from 'knex'

const assetPath = 'asset'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const widthColumnExists = await knex.schema.hasColumn(staticResourcePath, 'width')
  if (!widthColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.float('width').nullable()
    })
  }
  const heightColumnExists = await knex.schema.hasColumn(staticResourcePath, 'height')
  if (!heightColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.float('height').nullable()
    })
  }
  const depthColumnExists = await knex.schema.hasColumn(staticResourcePath, 'depth')
  if (!depthColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.float('depth').nullable()
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const widthColumnExists = await knex.schema.hasColumn(staticResourcePath, 'width')
  if (widthColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('width')
    })
  }
  const heightColumnExists = await knex.schema.hasColumn(staticResourcePath, 'height')
  if (heightColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('height')
    })
  }
  const depthColumnExists = await knex.schema.hasColumn(staticResourcePath, 'depth')
  if (depthColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('depth')
    })
  }
}
