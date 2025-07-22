import { instancePath } from '@ir-engine/common/src/schemas/networking/instance.schema'
import type { Knex } from 'knex'
import {
  addProjectColumn,
  dropProjectColumn
} from '../../../social/location/migrations/20240502080725_projectId-location-column'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await addProjectColumn(knex, instancePath)

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await dropProjectColumn(knex, instancePath)

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
