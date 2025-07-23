import { projectHistoryPath } from '@ir-engine/common/src/schema.type.module'
import { ActionIdentifierTypes, ActionTypes } from '@ir-engine/common/src/schemas/projects/project-history.schema'
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  /**
   * Migrate `action` type from enum to string
   */
  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.string('actionTemp', 255).notNullable()
  })

  await knex.raw('UPDATE `project-history` SET `actionTemp` = `action`')

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.dropColumn('action')
  })

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.renameColumn('actionTemp', 'action')
  })

  /**
   * Migrate `actionIdentifierType` type from enum to string
   */
  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.string('actionIdentifierTypeTemp', 255).notNullable()
  })

  await knex.raw('UPDATE `project-history` SET `actionIdentifierTypeTemp` = `actionIdentifierType`')

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.dropColumn('actionIdentifierType')
  })

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.renameColumn('actionIdentifierTypeTemp', 'actionIdentifierType')
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  /**
   * Rollback `action` type from string to enum
   */
  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.enum('actionTemp', ActionTypes).notNullable()
  })

  await knex.raw('UPDATE `project-history` SET `actionTemp` = `action`')

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.dropColumn('action')
  })

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.renameColumn('actionTemp', 'action')
  })

  /**
   * Rollback `actionIdentifierType` type from string to enum
   */
  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.enum('actionIdentifierTypeTemp', ActionIdentifierTypes).notNullable()
  })

  await knex.raw('UPDATE `project-history` SET `actionIdentifierTypeTemp` = `actionIdentifierType`')

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.dropColumn('actionIdentifierType')
  })

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.renameColumn('actionIdentifierTypeTemp', 'actionIdentifierType')
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
