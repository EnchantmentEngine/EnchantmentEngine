import type { Knex } from 'knex'

import { spawnPointPath } from '@ir-engine/common/src/schema.type.module'

const assetPath = 'asset'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(spawnPointPath)

  if (tableExists === false) {
    await knex.schema.createTable(spawnPointPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('sceneId').collate('utf8mb4_bin')
      table.foreign('sceneId').references('id').inTable(assetPath).onDelete('CASCADE').onUpdate('CASCADE')
      table.string('name').nullable()
      table.string('previewImageURL').nullable()
      table.json('position').notNullable()
      table.json('rotation').notNullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
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

  const tableExists = await knex.schema.hasTable(spawnPointPath)

  if (tableExists === true) {
    await knex.schema.dropTable(spawnPointPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
