import * as fs from 'fs'
import type { Knex } from 'knex'
import * as path from 'path'

const sqlFilePath = path.join(__dirname, './location_triggers.sql')

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const sql = fs.readFileSync(sqlFilePath, 'utf8')
  await knex.raw(sql)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP PROCEDURE IF EXISTS update_location_history;')
  await knex.raw('DROP TRIGGER IF EXISTS after_location_update;')

  await knex.raw('DROP PROCEDURE IF EXISTS insert_location_history;')
  await knex.raw('DROP TRIGGER IF EXISTS after_location_insert;')
}
