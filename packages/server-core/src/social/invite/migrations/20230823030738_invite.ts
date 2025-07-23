import type { Knex } from 'knex'

import { invitePath } from '@ir-engine/common/src/schemas/social/invite.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(invitePath)

  if (tableExists === false) {
    await knex.schema.createTable(invitePath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('token', 255).defaultTo(null)
      table.string('identityProviderType', 255).defaultTo(null)
      table.string('passcode', 255).notNullable()
      table.string('targetObjectId', 255).defaultTo(null)
      table.boolean('deleteOnUse').defaultTo(true)
      table.boolean('makeAdmin').defaultTo(false)
      table.string('spawnType', 255).defaultTo(null)
      table.json('spawnDetails').nullable()
      table.boolean('timed').defaultTo(false)
      table.dateTime('startTime').defaultTo(null)
      table.dateTime('endTime').defaultTo(null)
      //@ts-ignore
      table.uuid('userId', 36).collate('utf8mb4_bin').defaultTo(null).index()
      //@ts-ignore
      table.uuid('inviteeId', 36).collate('utf8mb4_bin').defaultTo(null).index()
      table.string('inviteType', 255).defaultTo(null).index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('inviteeId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('inviteType').references('type').inTable('invite-type').onDelete('SET NULL').onUpdate('CASCADE')
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

  const tableExists = await knex.schema.hasTable(invitePath)

  if (tableExists === true) {
    await knex.schema.dropTable(invitePath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
