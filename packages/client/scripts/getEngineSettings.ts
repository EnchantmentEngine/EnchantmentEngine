import knex from 'knex'

import { engineSettingPath, EngineSettingType } from '../../common/src/schema.type.module'

export const getEngineSetting = async (categories: EngineSettingType['category'][]) => {
  const knexClient = knex({
    client: 'mysql2',
    connection: {
      user: process.env.MYSQL_USER ?? 'server',
      password: process.env.MYSQL_PASSWORD ?? 'password',
      host: process.env.MYSQL_HOST ?? '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      database: process.env.MYSQL_DATABASE ?? 'ir-engine',
      charset: 'utf8mb4'
    }
  })

  const engineSetting = await knexClient
    .select()
    .from<EngineSettingType>(engineSettingPath)
    .whereIn('category', categories)
    .catch((e) => {
      console.warn(`[vite.config]: Failed to read engineSetting`, categories)
      console.warn(e)
    })

  await knexClient.destroy()

  return engineSetting
}
