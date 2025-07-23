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
    const currentTypes = await knex.select().from(projectPermissionTypePath)
    if (currentTypes.length > 0) {
      const hasUserType = currentTypes.find((item) => item.type === 'user')
      if (hasUserType) {
        await knex.from(projectPermissionTypePath).where({ type: 'user' }).del()
      }

      const hasEditorType = currentTypes.find((item) => item.type === 'editor')
      if (!hasEditorType) {
        await knex.from(projectPermissionTypePath).insert({ type: 'editor' })
      }
    }
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
    const currentTypes = await knex.select().from(projectPermissionTypePath)
    if (currentTypes.length > 0) {
      const hasUserType = currentTypes.find((item) => item.type === 'user')
      if (!hasUserType) {
        await knex.from(projectPermissionTypePath).insert({ type: 'user' })
      }

      const hasEditorType = currentTypes.find((item) => item.type === 'editor')
      if (hasEditorType) {
        await knex.from(projectPermissionTypePath).where({ type: 'editor' }).del()
      }
    }
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
