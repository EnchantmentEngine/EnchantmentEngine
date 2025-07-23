import type { Knex } from 'knex'

import { staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const thumbnailURLColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailURL')
  if (!thumbnailURLColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('thumbnailURL', 255).nullable()
    })
  }

  const thumbnailTypeColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailType')
  if (!thumbnailTypeColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('thumbnailType', 255).nullable()
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const thumbnailURLColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailURL')
  if (thumbnailURLColumnExists === true) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('thumbnailURL')
    })
  }

  const thumbnailTypeColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailType')
  if (thumbnailTypeColumnExists === true) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('thumbnailType')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
