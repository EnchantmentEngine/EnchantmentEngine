import type { Knex } from 'knex'

import { locationSettingPath } from '@ir-engine/common/src/schemas/social/location-setting.schema'
import { locationTypePath } from '@ir-engine/common/src/schemas/social/location-type.schema'
import { locationPath } from '@ir-engine/common/src/schemas/social/location.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'location_settings'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, locationSettingPath)
  }

  const tableExists = await knex.schema.hasTable(locationSettingPath)

  if (tableExists === false) {
    // Added transaction here in order to ensure both below queries run on same pool.
    // https://github.com/knex/knex/issues/218#issuecomment-56686210

    await knex.raw('SET FOREIGN_KEY_CHECKS=0')

    await knex.schema.createTable(locationSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()

      table.boolean('videoEnabled').defaultTo(false)
      table.boolean('audioEnabled').defaultTo(false)
      table.boolean('screenSharingEnabled').defaultTo(false)
      table.boolean('faceStreamingEnabled').defaultTo(false)

      //@ts-ignore
      table.uuid('locationId').collate('utf8mb4_bin').nullable().index()
      table.string('locationType', 255).nullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('locationId').references('id').inTable(locationPath).onDelete('CASCADE').onUpdate('CASCADE')
      table
        .foreign('locationType')
        .references('type')
        .inTable(locationTypePath)
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(locationSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(locationSettingPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
