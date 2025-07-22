import type { Knex } from 'knex'

import { instanceAuthorizedUserPath } from '@ir-engine/common/src/schemas/networking/instance-authorized-user.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'instance_authorized_user'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  let tableExists = await knex.schema.hasTable(instanceAuthorizedUserPath)
  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await knex.schema.dropTable(instanceAuthorizedUserPath)
    await knex.schema.renameTable(oldTableName, instanceAuthorizedUserPath)
  }

  tableExists = await knex.schema.hasTable(instanceAuthorizedUserPath)

  if (tableExists) {
    const hasIdColum = await knex.schema.hasColumn(instanceAuthorizedUserPath, 'id')
    const hasInstanceIdColumn = await knex.schema.hasColumn(instanceAuthorizedUserPath, 'instanceId')
    const hasUserIdColumn = await knex.schema.hasColumn(instanceAuthorizedUserPath, 'userId')
    if (!(hasInstanceIdColumn && hasIdColum && hasUserIdColumn)) {
      await knex.schema.dropTable(instanceAuthorizedUserPath)
      tableExists = false
    }
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')
  if (!tableExists && !oldNamedTableExists) {
    // Added transaction here in order to ensure both below queries run on same pool.
    // https://github.com/knex/knex/issues/218#issuecomment-56686210

    await knex.schema.createTable(instanceAuthorizedUserPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').notNullable()
      //@ts-ignore
      table.uuid('instanceId').collate('utf8mb4_bin').notNullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('instanceId').references('id').inTable('instance').onDelete('CASCADE').onUpdate('CASCADE')

      // Setting unique constraint for userId and instanceId combination
      table.unique(['userId', 'instanceId'], {
        indexName: 'instance_authorized_user_instanceId_userId_unique'
      })
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

  const tableExists = await knex.schema.hasTable(instanceAuthorizedUserPath)

  if (tableExists === true) {
    await knex.schema.dropTable(instanceAuthorizedUserPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
