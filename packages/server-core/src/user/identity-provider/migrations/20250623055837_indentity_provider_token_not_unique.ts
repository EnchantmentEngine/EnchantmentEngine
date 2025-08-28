import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  // Get all indexes on the table to find any unique constraint on token
  const allIndexes = await knex.raw(
    `SHOW INDEX FROM \`${identityProviderPath}\` WHERE Column_name = 'token' AND Non_unique = 0`
  )

  if (allIndexes[0].length > 0) {
    const uniqueKeyNames = [...new Set(allIndexes[0].map((idx) => idx.Key_name))]

    // Drop each unique constraint found
    for (const keyName of uniqueKeyNames) {
      if (typeof keyName != 'string') continue
      try {
        await knex.schema.alterTable(identityProviderPath, (table) => {
          table.dropUnique(['token'], keyName)
        })
        console.log(`Dropped unique constraint: ${keyName}`)
      } catch (error) {
        console.error(`Failed to drop unique constraint: ${keyName}`, error)
      }
    }
  }

  const tokenIndexInfo = await knex.raw(
    `SHOW INDEX FROM \`${identityProviderPath}\` WHERE Column_name = 'token' AND Non_unique = 1`
  )

  if (tokenIndexInfo[0].length === 0) {
    await knex.schema.alterTable(identityProviderPath, (table) => {
      table.index(['token'], 'token_index')
    })
    console.log('Added non-unique index: token_index')
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const indexInfo = await knex.raw(`SHOW INDEX FROM \`${identityProviderPath}\` WHERE Key_name = 'token_index'`)
  if (indexInfo[0].length > 0) {
    // Drop the non-unique index
    await knex.schema.alterTable(identityProviderPath, (table) => {
      table.dropIndex(['token'], 'token_index')
    })
  }

  try {
    await knex.schema.alterTable(identityProviderPath, (table) => {
      table.unique(['token'], { indexName: 'identity_provider_token_unique' })
    })
  } catch (error) {
    console.error('Failed to restore unique constraint on token. There may be duplicate tokens in the database.', error)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
