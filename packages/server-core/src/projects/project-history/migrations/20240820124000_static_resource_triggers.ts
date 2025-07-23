import * as fs from 'fs'
import type { Knex } from 'knex'
import * as path from 'path'

const sqlFilePath = path.join(__dirname, './static-resource_triggers.sql')

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
  await knex.raw('DROP PROCEDURE IF EXISTS handle_thumbnails;')
  await knex.raw('DROP PROCEDURE IF EXISTS handle_tags;')
  await knex.raw('DROP PROCEDURE IF EXISTS update_static_resource_history;')
  await knex.raw('DROP TRIGGER IF EXISTS after_static_resource_update;')

  await knex.raw('DROP PROCEDURE IF EXISTS insert_static_resource_history;')
  await knex.raw('DROP TRIGGER IF EXISTS after_static_resource_insert;')
}
