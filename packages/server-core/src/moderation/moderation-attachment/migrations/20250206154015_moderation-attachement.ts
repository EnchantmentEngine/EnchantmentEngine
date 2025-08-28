import { moderationAttachmentPath } from '@ir-engine/common/src/schemas/moderation/moderation-attachment.schema'
import { moderationPath } from '@ir-engine/common/src/schemas/moderation/moderation.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(moderationAttachmentPath)

  if (tableExists === false) {
    await knex.schema.createTable(moderationAttachmentPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('moderationId').collate('utf8mb4_bin').index()
      table.string('filePath')
      table.string('fileName')
      //@ts-ignore
      table.uuid('updatedBy', 36).collate('utf8mb4_bin').index()
      //@ts-ignore
      table.uuid('createdBy', 36).collate('utf8mb4_bin').index()

      table.dateTime('createdAt').notNullable()
      table.timestamp('updatedAt')

      table.foreign('moderationId').references('id').inTable(moderationPath).onDelete('SET NULL').onUpdate('CASCADE')
      table.foreign('updatedBy').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
      table.foreign('createdBy').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const reportAttachmentsExists = await knex.schema.hasTable(moderationAttachmentPath)

  if (reportAttachmentsExists === true) {
    await knex.schema.dropTable(moderationAttachmentPath)
  }
}
