import type { Knex } from 'knex'

import { githubRepoAccessPath } from '@ir-engine/common/src/schemas/user/github-repo-access.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(githubRepoAccessPath)

  if (tableExists === false) {
    await knex.schema.createTable(githubRepoAccessPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('repo', 255).notNullable()
      table.boolean('hasWriteAccess').nullable()
      //@ts-ignore
      table.uuid('identityProviderId').collate('utf8mb4_bin').nullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table
        .foreign('identityProviderId')
        .references('id')
        .inTable('identity-provider')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(githubRepoAccessPath)

  if (tableExists === true) {
    await knex.schema.dropTable(githubRepoAccessPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
