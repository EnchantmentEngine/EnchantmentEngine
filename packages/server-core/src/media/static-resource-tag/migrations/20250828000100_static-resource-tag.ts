import type { Knex } from 'knex'

import { staticResourceTagPath } from '@ir-engine/common/src/schemas/media/static-resource-tag.schema'

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(staticResourceTagPath)
  if (!tableExists) {
    await knex.schema.createTable(staticResourceTagPath, (table) => {
      table.increments('id').primary()
      table.string('project', 255).notNullable().index()
      table.string('tag', 255).notNullable()
      table.integer('count').notNullable().defaultTo(0)
      table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now())
      table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now())
      table.unique(['project', 'tag'])
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(staticResourceTagPath)
  if (tableExists) {
    await knex.schema.dropTable(staticResourceTagPath)
  }
}
