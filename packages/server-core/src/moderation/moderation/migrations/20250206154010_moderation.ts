import { moderationPath } from '@ir-engine/common/src/schemas/moderation/moderation.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(moderationPath, (table) => {
    //@ts-ignore
    table.uuid('id').collate('utf8mb4_bin').primary()
    table.string('reportDetails', 1050).notNullable()
    table.string('abuseReason', 255).notNullable()
    table.string('type', 255).notNullable()
    table.string('reportedUserIpAddress', 255).nullable()
    table.string('reportedUserCountry', 100).nullable()
    table.string('reportingUserCountry', 100).nullable()
    //@ts-ignore
    table.uuid('reportedUserId', 36).collate('utf8mb4_bin')

    //@ts-ignore
    table.string('reportedLocationId', 255).collate('utf8mb4_bin')
    table.string('status', 255).notNullable().defaultTo('open')
    table.string('ipAddress', 255).notNullable()

    //@ts-ignore
    table.uuid('updatedBy', 36).collate('utf8mb4_bin').index()
    //@ts-ignore
    table.uuid('createdBy', 36).collate('utf8mb4_bin').index()

    table.dateTime('reportedAt').notNullable()
    table.dateTime('createdAt').notNullable()
    table.dateTime('updatedAt').notNullable()

    table.foreign('reportedUserId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    table.foreign('reportedLocationId').references('id').inTable('location').onDelete('SET NULL').onUpdate('CASCADE')
    table.foreign('updatedBy').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    table.foreign('createdBy').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(moderationPath)
}
