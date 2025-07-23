import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { EngineSettingType } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'

import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const serverSettingPath = 'server-setting'

  const tableExists = await knex.schema.hasTable(serverSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(serverSettingPath).first()
    if (recordExists) {
      const serverSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.Server.Port,
            value: recordExists.port || ''
          },
          {
            key: EngineSettings.Server.Hostname,
            value: recordExists.hostname || ''
          },
          {
            key: EngineSettings.Server.Mode,
            value: recordExists.mode || ''
          },
          {
            key: EngineSettings.Server.ClientHost,
            value: recordExists.clientHost || ''
          },
          {
            key: EngineSettings.Server.RootDirectory,
            value: recordExists.rootDir || ''
          },
          {
            key: EngineSettings.Server.PublicDirectory,
            value: recordExists.publicDir || ''
          },
          {
            key: EngineSettings.Server.NodeModulesDirectory,
            value: recordExists.nodeModulesDir || ''
          },
          {
            key: EngineSettings.Server.LocalStorageProvider,
            value: recordExists.localStorageProvider || ''
          },
          {
            key: EngineSettings.Server.PerformDryRun,
            value: (Boolean(recordExists.performDryRun) || false).toString()
          },
          {
            key: EngineSettings.Server.StorageProvider,
            value: recordExists.storageProvider || ''
          },
          {
            key: EngineSettings.Server.Hub.Endpoint,
            value: JSON.parse(recordExists.hub)?.endpoint || ''
          },
          {
            key: EngineSettings.Server.Url,
            value: recordExists.url || ''
          },
          {
            key: EngineSettings.Server.CertPath,
            value: recordExists.certPath || ''
          },
          {
            key: EngineSettings.Server.KeyPath,
            value: recordExists.keyPath || ''
          },
          {
            key: EngineSettings.Server.GithubWebhookSecret,
            value: recordExists.githubWebhookSecret || ''
          },
          {
            key: EngineSettings.Server.Local,
            value: (Boolean(recordExists.local) || false).toString()
          },
          {
            key: EngineSettings.Server.ReleaseName,
            value: recordExists.releaseName || ''
          },
          {
            key: EngineSettings.Server.InstanceserverUnreachableTimeoutSeconds,
            value: recordExists.instanceserverUnreachableTimeoutSeconds || 0
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          dataType: getDataType(item.value),
          type: 'private' as EngineSettingType['type'],
          category: 'server',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )
      await knex.from(engineSettingPath).insert(serverSettings)
    }
  }

  await knex.schema.dropTableIfExists(serverSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
