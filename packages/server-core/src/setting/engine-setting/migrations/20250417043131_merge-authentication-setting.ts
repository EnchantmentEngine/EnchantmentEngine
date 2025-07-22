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
  const authenticationSettingPath = 'authentication-setting'

  const isAuthenticationTableExists = await knex.schema.hasTable(authenticationSettingPath)

  if (isAuthenticationTableExists) {
    const authenticationSettingRecord = await knex.table(authenticationSettingPath).first()

    if (authenticationSettingRecord) {
      const flattenedAuthData = flattenObjectToArray({
        service: authenticationSettingRecord.service,
        entity: authenticationSettingRecord.entity,
        jwtOptions:
          typeof authenticationSettingRecord.jwtOptions === 'string'
            ? JSON.parse(authenticationSettingRecord.jwtOptions)
            : authenticationSettingRecord.jwtOptions,
        bearerToken:
          typeof authenticationSettingRecord.bearerToken === 'string'
            ? JSON.parse(authenticationSettingRecord.bearerToken)
            : authenticationSettingRecord.bearerToken,
        authStrategies:
          typeof authenticationSettingRecord.authStrategies === 'string'
            ? JSON.parse(authenticationSettingRecord.authStrategies)
            : authenticationSettingRecord.authStrategies,
        oauth:
          typeof authenticationSettingRecord.oauth === 'string'
            ? JSON.parse(authenticationSettingRecord.oauth)
            : authenticationSettingRecord.oauth,
        jwtPublicKey: authenticationSettingRecord.jwtPublicKey,
        jwtAlgorithm: authenticationSettingRecord.jwtAlgorithm,
        secret: authenticationSettingRecord.secret,
        callback:
          typeof authenticationSettingRecord.callback === 'string'
            ? JSON.parse(authenticationSettingRecord.callback)
            : authenticationSettingRecord.callback
      })

      const authenticationSettings: EngineSettingType[] = await Promise.all(
        flattenedAuthData.map(async (authSetting) => ({
          key: authSetting.key,
          value: authSetting.value || '',
          id: uuidv4(),
          dataType: getDataType(`${authSetting.value}`),
          type: (authSetting.key.startsWith('authStrategies.') ? 'public' : 'private') as EngineSettingType['type'],
          category: 'authentication',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )

      await knex.from(engineSettingPath).insert([...authenticationSettings])
    }
  }

  await knex.schema.dropTableIfExists(authenticationSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
