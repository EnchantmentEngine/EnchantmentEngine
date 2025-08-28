import type { Knex } from 'knex'

import { projectPermissionTypePath } from '@ir-engine/common/src/schemas/projects/project-permission-type.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(projectPermissionTypePath)

  if (tableExists) {
    await knex.from(projectPermissionTypePath).where({ type: 'reviewer' }).del()
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(projectPermissionTypePath)

  if (tableExists) {
    await knex(projectPermissionTypePath).insert({ type: 'reviewer' })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
