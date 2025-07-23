import { projectPermissionPath } from '@ir-engine/common/src/schema.type.module'
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const updatedByColumnExists = await knex.schema.hasColumn(projectPermissionPath, 'updatedBy')
  if (!updatedByColumnExists) {
    await knex.schema.alterTable(projectPermissionPath, async (table) => {
      //@ts-ignore
      table.uuid('updatedBy', 36).collate('utf8mb4_bin')

      // Foreign keys
      table.foreign('updatedBy').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const updatedByColumnExists = await knex.schema.hasColumn(projectPermissionPath, 'updatedBy')
  if (updatedByColumnExists) {
    await knex.schema.alterTable(projectPermissionPath, async (table) => {
      table.dropForeign('updatedBy')
      table.dropColumn('updatedBy')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
