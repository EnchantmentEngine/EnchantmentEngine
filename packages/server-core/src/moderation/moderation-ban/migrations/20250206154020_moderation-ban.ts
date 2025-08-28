import { moderationBanPath } from '@ir-engine/common/src/schemas/moderation/moderation-ban.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(moderationBanPath, (table) => {
    //@ts-ignore
    table.uuid('id').collate('utf8mb4_bin').primary()
    //@ts-ignore
    table.uuid('banUserId', 36).collate('utf8mb4_bin')
    //@ts-ignore
    table.uuid('moderationId', 36).collate('utf8mb4_bin')
    table.string('banReason', 255)
    table.string('ipAddress', 255)
    table.dateTime('reportedAt')
    table.boolean('banned').defaultTo(false)
    //@ts-ignore
    table.string('reportedLocationId', 255).collate('utf8mb4_bin')

    //@ts-ignore
    table.uuid('updatedBy', 36).collate('utf8mb4_bin').index()
    //@ts-ignore
    table.uuid('createdBy', 36).collate('utf8mb4_bin').index()

    table.dateTime('createdAt').notNullable()
    table.dateTime('updatedAt').notNullable()

    table.foreign('banUserId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    table.foreign('updatedBy').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    table.foreign('createdBy').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    table.foreign('reportedLocationId').references('id').inTable('location').onDelete('SET NULL').onUpdate('CASCADE')
    table.foreign('moderationId').references('id').inTable('moderation').onDelete('SET NULL').onUpdate('CASCADE')
    table.unique(['banUserId'])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(moderationBanPath)
}
