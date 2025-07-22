import { scopeTypePath } from '@ir-engine/common/src/schemas/scope/scope-type.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const clientSettingPath = 'client-setting'
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  // Remove client-setting scope types from scope-type table
  await knex(scopeTypePath)
    .where('type', `${clientSettingPath}:read`)
    .orWhere('type', `${clientSettingPath}:write`)
    .del()

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
