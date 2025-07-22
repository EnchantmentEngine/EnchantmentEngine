import type { Knex } from 'knex'

import { staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'

export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'static_resource'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(staticResourcePath)

  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(staticResourcePath)
    await knex.schema.renameTable(oldTableName, staticResourcePath)
  }

  tableExists = await knex.schema.hasTable(staticResourcePath)

  if (!tableExists && !oldNamedTableExists) {
    await knex.schema.createTable(staticResourcePath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('sid', 255).notNullable()
      table.string('hash', 255).notNullable()
      table.string('url', 255).defaultTo(null)
      table.string('key', 255).defaultTo(null)
      table.string('mimeType', 255).defaultTo(null)
      table.json('metadata').defaultTo(null)
      table.string('project', 255).defaultTo(null)
      table.string('driver', 255).defaultTo(null)
      table.string('licensing', 255).defaultTo(null)
      table.string('attribution', 255).defaultTo(null)
      table.json('tags').defaultTo(null)
      table.json('stats').defaultTo(null)
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').defaultTo(null).index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      // Foreign keys
      table.foreign('userId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(staticResourcePath)

  if (tableExists === true) {
    await knex.schema.dropTable(staticResourcePath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
