// ensure logger is loaded first - it loads the dotenv config
import logger from './ServerLogger'

import knex from 'knex'

import { WebRTCSettings, defaultWebRTCSettings } from '@ir-engine/common/src/constants/DefaultWebRTCSettings'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { EngineSettingType, engineSettingPath } from '@ir-engine/common/src/schema.type.module'

import { parseValue } from '@ir-engine/common/src/utils/dataTypeUtils'
import { FlattenedEntry, unflattenArrayToObject } from '@ir-engine/common/src/utils/jsonHelperUtils'
import { createHash } from 'crypto'
import appConfig, { updateNestedConfig } from './appconfig'

const db = {
  user: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'ir-engine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306
}
const nonFeathersStrategies = ['emailMagicLink', 'smsMagicLink']

export const updateAppConfig = async (): Promise<void> => {
  if (appConfig.db.forceRefresh || !appConfig.kubernetes.enabled) return

  const knexClient = knex({
    client: 'mysql2',
    connection: {
      ...db,
      port: parseInt(db.port.toString()),
      charset: 'utf8mb4'
    }
  })

  const promises: any[] = []

  const categoriesToUnflatten = ['email', 'aws', 'authentication', 'client']

  const engineSettingPromise = knexClient
    .select()
    .from<EngineSettingType>(engineSettingPath)
    .then((dbEngineSettings) => {
      // jsonkey undefined and its for plain key value pair settings and not in categoriesToUnflatten
      dbEngineSettings
        .filter((setting) => !setting.jsonKey && !categoriesToUnflatten.includes(setting.category))
        .forEach((setting) => {
          if (!appConfig[setting.category]) {
            appConfig[setting.category] = {}
          }
          if (setting.key.includes('.')) {
            updateNestedConfig(appConfig, setting)
          } else {
            appConfig[setting.category][setting.key] = parseValue(setting.value, setting.dataType)
          }
        })

      categoriesToUnflatten.forEach((category) => {
        processSettings(dbEngineSettings, category)
      })
      // when jsonkey is defined and its instance-server-webrtc category and jsonKey is WebRTCSettings
      const webRtcServerKeyValues: FlattenedEntry[] = dbEngineSettings
        .filter(
          (setting) =>
            setting.jsonKey &&
            setting.jsonKey === EngineSettings.InstanceServer.WebRTCSettings &&
            setting.category === 'instance-server-webrtc'
        )
        .map((setting) => {
          return {
            key: setting.key,
            value: setting.value,
            dataType: setting.dataType
          }
        })
      if (!appConfig['instance-server-webrtc'] || !appConfig['instance-server-webrtc'].webRTCSettings) {
        appConfig['instance-server-webrtc'] = {
          webRTCSettings: defaultWebRTCSettings
        }
      }

      appConfig['instance-server-webrtc'].webRTCSettings = unflattenArrayToObject(
        webRtcServerKeyValues
      ) as WebRTCSettings
    })

    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read engineSetting: ${e.message}`)
    })
  promises.push(engineSettingPromise)
  await Promise.all(promises)
}

const processSettings = (settings: EngineSettingType[], category: string) => {
  const filteredSettings = settings.filter((setting) => setting.category === category)
  const settingsObject = unflattenArrayToObject(
    filteredSettings.map((setting) => ({
      key: setting.key,
      value: setting.value,
      dataType: setting.dataType
    }))
  )
  if (category === 'authentication') {
    const authStrategies = ['jwt']
    for (const authStrategy of settingsObject.authStrategies) {
      const keys = Object.keys(authStrategy)
      for (const key of keys) {
        if (nonFeathersStrategies.indexOf(key) < 0 && authStrategies.indexOf(key) < 0) {
          authStrategies.push(key)
        }
      }
    }
    delete (settingsObject as any).authStrategies

    appConfig.authentication = {
      ...appConfig.authentication,
      ...(settingsObject as any),
      secret: settingsObject.secret.split(String.raw`\n`).join('\n'),
      authStrategies: authStrategies
    }

    if (settingsObject.oauth?.github?.privateKey) {
      appConfig.authentication.oauth.github.privateKey = settingsObject.oauth.github.privateKey
        .split(String.raw`\n`)
        .join('\n')
    }

    if (settingsObject.jwtPublicKey && typeof settingsObject.jwtPublicKey === 'string') {
      appConfig.authentication.jwtPublicKey = settingsObject.jwtPublicKey.split(String.raw`\n`).join('\n')
      ;(appConfig.authentication.jwtOptions as any).keyid = createHash('sha3-256')
        .update(appConfig.authentication.jwtPublicKey)
        .digest('hex')
    }

    appConfig.authentication.jwtOptions.algorithm = settingsObject.jwtAlgorithm || 'HS256'
  } else {
    appConfig[category] = {
      ...appConfig[category],
      ...settingsObject
    }
  }
}
