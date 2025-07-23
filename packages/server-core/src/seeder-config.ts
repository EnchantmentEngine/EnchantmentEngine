import fs from 'fs'
import path from 'path'

import { KnexSeed } from '@ir-engine/common/src/interfaces/KnexSeed'
import { ProjectConfigInterface } from '@ir-engine/projects/ProjectConfigInterface'

import { integrationsSeeds } from './integrations/seeder-config'
import { mediaSeeds } from './media/seeder-config'
import { networkingSeeds } from './networking/seeder-config'
import { projectSeeds } from './projects/seeder-config'
import { routeSeeds } from './route/seeder-config'
import { scopeSeeds } from './scope/seeder-config'
import { settingSeeds } from './setting/seeder-config'
import { socialSeeds } from './social/seeder-config'
import { userSeeds } from './user/seeder-config'

const installedProjects = fs.existsSync(path.resolve(__dirname, '../../projects/projects'))
  ? async () => {
      const projects = fs
        .readdirSync(path.resolve(__dirname, '../../projects/projects'), { withFileTypes: true })
        .filter((orgDir) => orgDir.isDirectory())
        .map((orgDir) => {
          return fs
            .readdirSync(path.resolve(__dirname, '../../projects/projects', orgDir.name), { withFileTypes: true })
            .filter((projectDir) => projectDir.isDirectory())
            .map((projectDir) => `${orgDir.name}/${projectDir.name}`)
        })
        .flat()
      const seederDirs = (
        await Promise.all(
          projects.map(async (projectName) => {
            try {
              const configPath = `../../projects/projects/${projectName}/xrengine.config.ts`
              const config: ProjectConfigInterface = (await import(configPath)).default
              if (!config.databaseSeed) return null
              return path.join(projectName, config.databaseSeed)
            } catch (e) {
              // console.log(e)
            }
          })
        )
      ).filter((hasServices) => !!hasServices)
      return (
        await Promise.all(
          seederDirs.map(async (seedDir) => (await import(`../../projects/projects/${seedDir}`)).default)
        )
      ).flat()
    }
  : async () => []

export const knexSeeds = (): Promise<Array<KnexSeed>> => {
  return installedProjects().then((installedProjectSeeds: KnexSeed[]) => {
    return [
      ...routeSeeds,
      ...settingSeeds,
      ...scopeSeeds,
      ...userSeeds,
      ...socialSeeds,
      ...projectSeeds,
      ...mediaSeeds,
      ...networkingSeeds,
      ...integrationsSeeds,
      ...installedProjectSeeds
    ]
  })
}
