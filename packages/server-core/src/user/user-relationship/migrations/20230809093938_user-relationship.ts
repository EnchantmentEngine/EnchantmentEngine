import type { Knex } from 'knex'

import { userRelationshipPath } from '@ir-engine/common/src/schemas/user/user-relationship.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'user_relationship'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(userRelationshipPath)
  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(userRelationshipPath)
    await knex.schema.renameTable(oldTableName, userRelationshipPath)
  }

  tableExists = await knex.schema.hasTable(userRelationshipPath)

  if (!tableExists && !oldNamedTableExists) {
    await knex.schema.createTable(userRelationshipPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').nullable().index()
      //@ts-ignore
      table.uuid('relatedUserId').collate('utf8mb4_bin').nullable().index()
      table.string('userRelationshipType', 255).nullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.unique(['userId', 'relatedUserId'])

      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('relatedUserId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table
        .foreign('userRelationshipType')
        .references('type')
        .inTable('user-relationship-type')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(userRelationshipPath)

  if (tableExists === true) {
    await knex.schema.dropTable(userRelationshipPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
