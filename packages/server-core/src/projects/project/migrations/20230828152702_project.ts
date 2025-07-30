import type { Knex } from 'knex'

import { projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(projectPath)

  if (tableExists === false) {
    // Added transaction here in order to ensure both below queries run on same pool.
    // https://github.com/knex/knex/issues/218#issuecomment-56686210

    await knex.raw('SET FOREIGN_KEY_CHECKS=0')

    await knex.schema.createTable(projectPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary().notNullable()
      table.string('name', 255).defaultTo(null)
      table.string('repositoryPath', 255).defaultTo(null)
      table.json('settings').defaultTo(null)
      table.boolean('needsRebuild').defaultTo(null)
      table.string('sourceRepo', 255).defaultTo(null)
      table.string('sourceBranch', 255).defaultTo(null)
      table.string('updateType', 255).defaultTo(null)
      table.string('updateSchedule', 255).defaultTo(null)
      //@ts-ignore
      table.uuid('updateUserId').collate('utf8mb4_bin').defaultTo(null)
      table.string('commitSHA', 255).defaultTo(null)
      table.dateTime('commitDate').defaultTo(null)
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
    })

    await knex.raw('SET FOREIGN_KEY_CHECKS=1')
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(projectPath)

  if (tableExists === true) {
    await knex.schema.dropTable(projectPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
