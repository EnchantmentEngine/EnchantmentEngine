import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
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
  const instanceServerSettingPath = 'instance-server-setting'

  const tableExists = await knex.schema.hasTable(instanceServerSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(instanceServerSettingPath).first()

    if (recordExists) {
      const webRTCSettings = recordExists.webRTCSettings || {}
      const webRtcSettings = flattenObjectToArray(
        typeof webRTCSettings == 'string' ? JSON.parse(webRTCSettings) : webRTCSettings
      )
      const instanceServerSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.InstanceServer.ClientHost,
            value: recordExists.clientHost || process.env.APP_HOST || ''
          },
          {
            key: EngineSettings.InstanceServer.RtcStartPort,
            value: recordExists.RtcStartPort || parseInt(process.env.RTC_START_PORT!)
          },
          {
            key: EngineSettings.InstanceServer.RtcEndPort,
            value: recordExists.RtcEndPort || parseInt(process.env.RTC_END_PORT!)
          },
          {
            key: EngineSettings.InstanceServer.RtcPortBlockSize,
            value: recordExists.RtcPortBlockSize || parseInt(process.env.RTC_PORT_BLOCK_SIZE!)
          },
          {
            key: EngineSettings.InstanceServer.IdentifierDigits,
            value: recordExists.IdentifierDigits || 5
          },
          {
            key: EngineSettings.InstanceServer.Local,
            value: recordExists.local || process.env.LOCAL === 'true'
          },
          {
            key: EngineSettings.InstanceServer.Domain,
            value: recordExists.domain || process.env.INSTANCESERVER_DOMAIN || 'instanceserver.etherealengine.com'
          },
          {
            key: EngineSettings.InstanceServer.ReleaseName,
            value: recordExists.releaseName || process.env.RELEASE_NAME || 'local'
          },
          {
            key: EngineSettings.InstanceServer.Port,
            value: recordExists.port || process.env.INSTANCESERVER_PORT || '3031'
          },
          {
            key: EngineSettings.InstanceServer.Mode,
            value: recordExists.mode || process.env.INSTANCESERVER_MODE || 'dev'
          },
          {
            key: EngineSettings.InstanceServer.LocationName,
            value: recordExists.locationName || process.env.PRELOAD_LOCATION_NAME || ''
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          dataType: getDataType(`${item.value}`),
          type: 'private' as EngineSettingType['type'],
          category: 'instance-server',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )
      const instanceServerWebRtc: EngineSettingType[] = await Promise.all(
        webRtcSettings.map(async ({ key, value }) => ({
          id: uuidv4(),
          key,
          value: `${value}`, // for some reason the boolean value are converted to 0 and 1 in db , so putt in string case keep it true/false
          jsonKey: EngineSettings.InstanceServer.WebRTCSettings,
          dataType: getDataType(`${value}`),
          type: 'private' as EngineSettingType['type'],
          category: 'instance-server-webrtc',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )
      await knex.from(engineSettingPath).insert([...instanceServerSettings, ...instanceServerWebRtc])
    }
  }

  await knex.schema.dropTableIfExists(instanceServerSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
