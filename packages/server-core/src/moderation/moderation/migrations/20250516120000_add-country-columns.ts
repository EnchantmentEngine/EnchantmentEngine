import { moderationPath } from '@ir-engine/common/src/schemas/moderation/moderation.schema'
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  // Add country columns for both reported and reporting users
  await knex.schema.alterTable(moderationPath, (table) => {
    table.string('reportedUserCountry', 100).nullable()
    table.string('reportingUserCountry', 100).nullable()
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await knex.schema.alterTable(moderationPath, (table) => {
    table.dropColumn('reportedUserCountry')
    table.dropColumn('reportingUserCountry')
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
