import type { Knex } from 'knex'

import { scopeTypePath, ScopeTypeType } from '@ir-engine/common/src/schemas/scope/scope-type.schema'
import { ScopeType } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const clientSettingPath = 'client-setting'
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(scopeTypePath)

  if (tableExists === true) {
    const scopeTypeData: ScopeTypeType[] = [
      {
        type: `${clientSettingPath}:read` as ScopeType,
        createdAt: await getDateTimeSql(),
        updatedAt: await getDateTimeSql()
      },
      {
        type: `${clientSettingPath}:write` as ScopeType,
        createdAt: await getDateTimeSql(),
        updatedAt: await getDateTimeSql()
      }
    ]
    await knex.table(scopeTypePath).insert(scopeTypeData)
  }
  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
