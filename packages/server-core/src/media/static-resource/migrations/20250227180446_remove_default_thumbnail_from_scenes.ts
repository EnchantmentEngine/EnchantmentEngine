import type { Knex } from 'knex'

export const staticResourcePath = 'static-resource'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(staticResourcePath)

  if (tableExists) {
    await knex(staticResourcePath)
      .whereNot('project', 'enchantmentengine/default-project')
      .andWhere('type', 'scene')
      .andWhere('thumbnailKey', 'projects/enchantmentengine/default-project/public/scenes/default.thumbnail.jpg')
      .update({ thumbnailKey: null })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
