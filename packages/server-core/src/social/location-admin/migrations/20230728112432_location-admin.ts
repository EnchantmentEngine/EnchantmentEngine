import type { Knex } from 'knex'

import { locationAdminPath } from '@ir-engine/common/src/schemas/social/location-admin.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'location_admin'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(locationAdminPath)
  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(locationAdminPath)
    await knex.schema.renameTable(oldTableName, locationAdminPath)
  }

  tableExists = await knex.schema.hasTable(locationAdminPath)

  if (tableExists === false) {
    // Added transaction here in order to ensure both below queries run on same pool.
    // https://github.com/knex/knex/issues/218#issuecomment-56686210

    await knex.raw('SET FOREIGN_KEY_CHECKS=0')

    await knex.schema.createTable(locationAdminPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').nullable().index()
      //@ts-ignore
      table.uuid('locationId').collate('utf8mb4_bin').nullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('locationId').references('id').inTable('location').onDelete('CASCADE').onUpdate('CASCADE')
    })

    await knex.raw('SET FOREIGN_KEY_CHECKS=1')
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(locationAdminPath)

  if (tableExists === true) {
    await knex.schema.dropTable(locationAdminPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
