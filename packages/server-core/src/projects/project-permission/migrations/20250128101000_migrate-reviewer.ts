import type { Knex } from 'knex'

import { projectPermissionPath } from '@ir-engine/common/src/schemas/projects/project-permission.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(projectPermissionPath)

  if (tableExists) {
    await knex(projectPermissionPath).where({ type: 'reviewer' }).update({ type: 'editor' })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
