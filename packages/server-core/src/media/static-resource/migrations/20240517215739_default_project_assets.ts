import type { Knex } from 'knex'

import { projectPath } from '@ir-engine/common/src/schema.type.module'

export const assetPath = 'asset'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(assetPath)

  if (tableExists) {
    const project = await knex.select().from(projectPath).where({ name: 'default-project' }).first()
    if (project) {
      const assets = await knex.select().from(assetPath).where({ projectId: project.id })
      for (const asset of assets) {
        if (
          asset.assetURL.startsWith('projects/default-project') &&
          !asset.assetURL.startsWith('projects/default-project/public/scenes')
        ) {
          await knex(assetPath)
            .where({ id: asset.id })
            .update({
              assetURL: asset.assetURL.replace('projects/default-project', 'projects/default-project/public/scenes'),
              thumbnailURL: asset.thumbnailURL
                ? asset.thumbnailURL.replace('projects/default-project', 'projects/default-project/public/scenes')
                : null
            })
        }
      }
    }
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(assetPath)

  if (tableExists) {
    const project = await knex.select().from(projectPath).where({ name: 'default-project' }).first()
    if (project) {
      const assets = await knex.select().from(assetPath).where({ projectId: project.id })
      for (const asset of assets) {
        if (asset.assetURL.startsWith('projects/default-project/public/scenes')) {
          await knex(assetPath)
            .where({ id: asset.id })
            .update({
              assetURL: asset.assetURL.replace('projects/default-project/public/scenes', 'projects/default-project'),
              thumbnailURL: asset.thumbnailURL
                ? asset.thumbnailURL.replace('projects/default-project/public/scenes', 'projects/default-project')
                : null
            })
        }
      }
    }
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
