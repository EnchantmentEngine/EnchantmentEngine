import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const locationBanPath = 'location-ban'
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'location_ban'

  let tableExists = await knex.schema.hasTable(locationBanPath)
  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    if (tableExists) await knex.schema.dropTable(locationBanPath)
    await knex.schema.renameTable(oldTableName, locationBanPath)
  }

  tableExists = await knex.schema.hasTable(locationBanPath)

  if (tableExists) {
    const hasIdColum = await knex.schema.hasColumn(locationBanPath, 'id')
    const hasLocationIdColumn = await knex.schema.hasColumn(locationBanPath, 'locationId')
    const hasUserIdColumn = await knex.schema.hasColumn(locationBanPath, 'userId')
    if (!(hasLocationIdColumn && hasIdColum && hasUserIdColumn)) {
      await knex.schema.dropTable(locationBanPath)
      tableExists = false
    }
  }

  if (tableExists === false) {
    // Added transaction here in order to ensure both below queries run on same pool.
    // https://github.com/knex/knex/issues/218#issuecomment-56686210

    await knex.raw('SET FOREIGN_KEY_CHECKS=0')

    await knex.schema.createTable(locationBanPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').nullable().index()
      //@ts-ignore
      table.uuid('locationId').collate('utf8mb4_bin').nullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
      table.foreign('locationId').references('id').inTable('location').onDelete('SET NULL').onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(locationBanPath)

  if (tableExists === true) {
    await knex.schema.dropTable(locationBanPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
