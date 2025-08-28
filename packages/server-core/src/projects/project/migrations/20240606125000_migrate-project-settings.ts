import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { ProjectDatabaseType, projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import { ProjectSettingType, projectSettingPath } from '@ir-engine/common/src/schemas/setting/project-setting.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'

const getConvertedProjectSettings = async (projects: ProjectDatabaseType[]) => {
  const projectSettings: ProjectSettingType[] = []

  for (const project of projects) {
    let settings: { key: string; value: string }[] = []

    if (typeof project['settings'] === 'string') {
      settings = JSON.parse(project['settings'])

      // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
      // was serialized multiple times, therefore we need to parse it twice.
      if (typeof settings === 'string') {
        settings = JSON.parse(settings)

        // There are some old records in our database that requires further parsing.
        if (typeof settings === 'string') {
          settings = JSON.parse(settings)
        }
      }
    }

    for (const setting of settings) {
      projectSettings.push({
        id: uuidv4(),
        key: setting.key,
        value: setting.value,
        type: 'private',
        projectId: project.id,
        createdAt: await getDateTimeSql(),
        updatedAt: await getDateTimeSql()
      })
    }
  }

  return projectSettings
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const settingsColumnExists = await knex.schema.hasColumn(projectPath, 'settings')

  if (settingsColumnExists === true) {
    const projects = await knex.select().from(projectPath)

    if (projects.length > 0) {
      const projectSettings = await getConvertedProjectSettings(projects.filter((item) => item.settings))

      if (projectSettings.length > 0) {
        await knex.from(projectSettingPath).insert(projectSettings)
      }
    }

    await knex.schema.alterTable(projectPath, async (table) => {
      table.dropColumn('settings')
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const settingsColumnExists = await knex.schema.hasColumn(projectPath, 'settings')

  if (settingsColumnExists === false) {
    await knex.schema.alterTable(projectPath, async (table) => {
      table.json('settings').defaultTo(null)
    })
  }
}
