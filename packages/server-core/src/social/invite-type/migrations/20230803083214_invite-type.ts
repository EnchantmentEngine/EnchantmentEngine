import type { Knex } from 'knex'

import { inviteTypePath } from '@ir-engine/common/src/schemas/social/invite-type.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'invite_type'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, inviteTypePath)
  }

  const tableExists = await knex.schema.hasTable(inviteTypePath)

  if (tableExists === false) {
    await knex.schema.createTable(inviteTypePath, (table) => {
      //@ts-ignore
      table.string('type', 255).notNullable().unique().primary()
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(inviteTypePath)

  if (tableExists === true) {
    await knex.schema.dropTable(inviteTypePath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
