import type { Knex } from 'knex'

import { instanceAttendancePath } from '@ir-engine/common/src/schemas/networking/instance-attendance.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'instance_attendance'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(instanceAttendancePath)
  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(instanceAttendancePath)
    await knex.schema.renameTable(oldTableName, instanceAttendancePath)
  }

  tableExists = await knex.schema.hasTable(instanceAttendancePath)

  if (!tableExists && !oldNamedTableExists) {
    await knex.schema.createTable(instanceAttendancePath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('sceneId', 255)
      table.boolean('isChannel').nullable()
      table.boolean('ended').defaultTo(0)
      table.string('peerId', 255)
      table.integer('peerIndex')
      //@ts-ignore
      table.uuid('userId', 36).collate('utf8mb4_bin').index().nullable()
      //@ts-ignore
      table.uuid('instanceId', 36).collate('utf8mb4_bin').index().nullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
      table.foreign('instanceId').references('id').inTable('instance').onDelete('SET NULL').onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(instanceAttendancePath)

  if (tableExists === true) {
    await knex.schema.dropTable(instanceAttendancePath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
