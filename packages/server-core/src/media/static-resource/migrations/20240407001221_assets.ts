import type { Knex } from 'knex'
import { v4 } from 'uuid'

import { projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import { locationPath, LocationType } from '@ir-engine/common/src/schemas/social/location.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'

export const assetPath = 'asset'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const sceneTableExists = await knex.schema.hasTable(assetPath)

  if (sceneTableExists === false) {
    await knex.schema.createTable(assetPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('assetURL', 255).notNullable().unique()
      //@ts-ignore
      table.uuid('projectId').collate('utf8mb4_bin')
      table.foreign('projectId').references('id').inTable(projectPath).onDelete('CASCADE').onUpdate('CASCADE')
      table.string('thumbnailURL', 255)
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
    })

    const locations = await knex.select().from(locationPath)
    if (locations.length > 0) {
      const locationSceneIds = await Promise.all(
        locations
          .filter((item) => item.sceneId)
          .map(async (location: LocationType) => {
            const id = v4()
            await knex.from(locationPath).where({ sceneId: location.sceneId }).update({ sceneId: id })
            const [, projectName] = location.sceneId.split('/')
            const projects = await knex.select().from(projectPath).where('name', projectName)
            if (!projects.length) return
            const projectId = projects[0].id
            return {
              id,
              assetURL: location.sceneId,
              thumbnailURL: location.sceneId.replace('.scene.json', '.thumbnail.jpg'),
              projectId,
              createdAt: await getDateTimeSql(),
              updatedAt: await getDateTimeSql()
            }
          })
          .filter(Boolean)
      )

      await knex.from(assetPath).insert(locationSceneIds)
    }
  }

  /** Change location table from storing sceneId as string to ref the scenetable */
  await knex.schema.alterTable(locationPath, (table) => {
    //@ts-ignore
    table.uuid('sceneId').collate('utf8mb4_bin').alter()
    table.foreign('sceneId').references('id').inTable(assetPath).onDelete('CASCADE').onUpdate('CASCADE')
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(assetPath)

  if (tableExists === true) {
    await knex.schema.dropTable(assetPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
