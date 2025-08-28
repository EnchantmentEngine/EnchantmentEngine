import type { Knex } from 'knex'

import { recordingResourcePath } from '@ir-engine/common/src/schemas/recording/recording-resource.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'recording_resource'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(recordingResourcePath)

  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(recordingResourcePath)
    await knex.schema.renameTable(oldTableName, recordingResourcePath)
  }

  tableExists = await knex.schema.hasTable(recordingResourcePath)

  if (tableExists) {
    const hasIdColum = await knex.schema.hasColumn(recordingResourcePath, 'id')
    const hasRecordingIdColumn = await knex.schema.hasColumn(recordingResourcePath, 'recordingId')
    const hasStaticResourcesIdColumn = await knex.schema.hasColumn(recordingResourcePath, 'staticResourceId')
    if (!(hasRecordingIdColumn && hasIdColum && hasStaticResourcesIdColumn)) {
      await knex.schema.dropTable(recordingResourcePath)
      tableExists = false
    }
  }

  if (!tableExists && !oldNamedTableExists) {
    await knex.schema.createTable(recordingResourcePath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('recordingId').collate('utf8mb4_bin').nullable()
      //@ts-ignore
      table.uuid('staticResourceId').collate('utf8mb4_bin').nullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      // Foreign keys
      table.unique(['recordingId', 'staticResourceId'], {
        indexName: 'recording_resource_recordingId_staticResourceId_unique'
      })

      table.foreign('recordingId').references('id').inTable('recording').onDelete('CASCADE').onUpdate('CASCADE')

      table
        .foreign('staticResourceId')
        .references('id')
        .inTable('static-resource')
        .onDelete('CASCADE')
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

  const tableExists = await knex.schema.hasTable(recordingResourcePath)

  if (tableExists === true) {
    await knex.schema.dropTable(recordingResourcePath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
