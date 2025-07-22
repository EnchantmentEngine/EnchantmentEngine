import type { Knex } from 'knex'

import { locationPath } from '@ir-engine/common/src/schemas/social/location.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const sceneIdColumnExists = await knex.schema.hasColumn(locationPath, 'sceneId')

  if (sceneIdColumnExists === true) {
    await knex
      .from(locationPath)
      .update({ sceneId: knex.raw("CONCAT('projects/', ??, '.scene.json')", ['sceneId']) })
      .where('sceneId', 'not like', '%projects/%')
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
