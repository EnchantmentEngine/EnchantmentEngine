import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schema.type.module'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { flattenObjectToArray } from '@ir-engine/common/src/utils/jsonHelperUtils'
import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const clientSettingPath = 'client-setting'
  const isClientTableExists = await knex.schema.hasTable(clientSettingPath)

  if (isClientTableExists) {
    const clientSettingRecord = await knex.table(clientSettingPath).first()

    if (clientSettingRecord) {
      // Fields to exclude from migration
      const excludedFields = ['key8thWall', 'themeModes', 'themeSettings']

      // Create a clean object without excluded fields
      const clientData = { ...clientSettingRecord }
      excludedFields.forEach((field) => delete clientData[field])

      // Handle JSON fields
      try {
        // Parse JSON fields if they exist
        if (clientData.appSocialLinks) {
          clientData.appSocialLinks = JSON.parse(clientData.appSocialLinks)
        }
        if (clientData.mediaSettings) {
          clientData.mediaSettings = JSON.parse(clientData.mediaSettings)
        }
      } catch (error) {
        console.error('Error parsing JSON fields:', error)
      }

      // Flatten the object
      const flattenedClientData = flattenObjectToArray(clientData)

      // Create engine settings entries
      const clientSettings: EngineSettingType[] = await Promise.all(
        flattenedClientData.map(async (clientSetting) => ({
          key: clientSetting.key,
          value: clientSetting.value || '',
          id: uuidv4(),
          dataType: getDataType(`${clientSetting.value}`),
          type: 'public' as EngineSettingType['type'],
          category: 'client',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )

      await knex.from(engineSettingPath).insert([...clientSettings])
    }
  }

  await knex.schema.dropTableIfExists(clientSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  // If needed, implement a rollback strategy
  // This would involve retrieving client settings from engine-setting and restoring them to client-setting
}
