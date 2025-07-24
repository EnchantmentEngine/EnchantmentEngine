import type { Knex } from 'knex'

import { staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import { locationPath } from '@ir-engine/common/src/schemas/social/location.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(locationPath)

  if (tableExists === false) {
    await knex.schema.createTable(locationPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('name', 255).notNullable()
      table.string('sceneId', 255).nullable()
      table.string('slugifiedName', 255).notNullable().unique()
      table.boolean('isLobby').defaultTo(false)
      table.boolean('isFeatured').defaultTo(false)
      table.integer('maxUsersPerInstance').notNullable().defaultTo(50)
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
      //@ts-ignore
      table.uuid('projectId', 36).collate('utf8mb4_bin').nullable().index()
      //@ts-ignore
      table.uuid('updatedBy', 36).collate('utf8mb4_bin')

      // Foreign keys
      table.foreign('updatedBy').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
      table.foreign('projectId').references('id').inTable('project').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('sceneId').references('id').inTable(staticResourcePath).onDelete('CASCADE').onUpdate('CASCADE')
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(locationPath)

  if (tableExists === true) {
    await knex.schema.dropTable(locationPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
