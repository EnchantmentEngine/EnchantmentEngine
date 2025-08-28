import type { Knex } from 'knex'

import { userRelationshipTypePath } from '@ir-engine/common/src/schemas/user/user-relationship-type.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'user_relationship_type'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(userRelationshipTypePath)
  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(userRelationshipTypePath)
    await knex.schema.renameTable(oldTableName, userRelationshipTypePath)
  }

  tableExists = await knex.schema.hasTable(userRelationshipTypePath)

  if (!tableExists && !oldNamedTableExists) {
    await knex.schema.createTable(userRelationshipTypePath, (table) => {
      //@ts-ignore
      table.string('type', 255).notNullable().unique().primary()
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

  const tableExists = await knex.schema.hasTable(userRelationshipTypePath)

  if (tableExists === true) {
    await knex.schema.dropTable(userRelationshipTypePath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
