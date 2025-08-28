import type { Knex } from 'knex'

import { invalidationPath } from '@ir-engine/common/src/schemas/media/invalidation.schema'

export async function up(knex: Knex): Promise<void> {
  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  let tableExists = await knex.schema.hasTable(invalidationPath)

  if (!tableExists) {
    await knex.schema.createTable(invalidationPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('path', 255).notNullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(invalidationPath)

  if (tableExists === true) {
    await knex.schema.dropTable(invalidationPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
