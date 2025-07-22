import { moderationPath } from '@ir-engine/common/src/schemas/moderation/moderation.schema'
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  // 1. Add the column as nullable
  await knex.schema.alterTable(moderationPath, (table) => {
    table.integer('referenceNumber').unsigned().nullable()
  })

  // 2. Backfill values
  const records = await knex(moderationPath).select('id').orderBy('createdAt', 'asc')
  for (let i = 0; i < records.length; i++) {
    await knex(moderationPath)
      .where('id', records[i].id)
      .update({ referenceNumber: i + 1 })
  }

  // 3. Modify the column to be AUTO_INCREMENT and UNIQUE using raw SQL
  await knex.raw(
    `ALTER TABLE ${moderationPath} MODIFY COLUMN referenceNumber INT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE`
  )

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await knex.schema.alterTable(moderationPath, (table) => {
    table.dropColumn('referenceNumber')
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
