import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('location-ban')
  if (tableExists) {
    await knex.schema.dropTable('location-ban')
  }
}
export async function down(knex: Knex): Promise<void> {}
