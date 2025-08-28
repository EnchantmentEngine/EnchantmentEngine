import type { Knex } from 'knex'

const instanceAttendanceTable = 'instance-attendance'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const peerIDColumnExists = await knex.schema.hasColumn(instanceAttendanceTable, 'peerId')

  if (peerIDColumnExists === false) {
    await knex.schema.alterTable(instanceAttendanceTable, (table) => {
      table.string('peerId', 255)
      table.integer('peerIndex')
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

  const projectColumnExists = await knex.schema.hasColumn(instanceAttendanceTable, 'peerId')

  if (projectColumnExists === true) {
    await knex.schema.alterTable(instanceAttendanceTable, (table) => {
      table.dropColumn('peerId')
      table.dropColumn('peerIndex')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
