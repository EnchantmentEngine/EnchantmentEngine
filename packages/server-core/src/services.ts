import fs from 'fs'
import path from 'path'

import { ProjectConfigInterface } from '@ir-engine/projects/ProjectConfigInterface'

import { Application } from '../declarations'
import AssetServices from './assets/services'
import BotService from './bot/services'
import ClusterServices from './cluster/services'
import IntegrationServices from './integrations/services'
import MatchMakingServices from './matchmaking/services'
import MediaServices from './media/services'
import ModerationServices from './moderation/services'
import NetworkingServices from './networking/services'
import EntityServices from './projects/services'
import RecordingServices from './recording/services'
import RouteService from './route/service'
import ScopeService from './scope/service'
import SettingService from './setting/service'
import SocialServices from './social/services'
import UserServices from './user/services'
import WorldServices from './world/services'

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
      const servicesDirs = (
        await Promise.all(
          projects.map(async (projectName) => {
            try {
              const configPath = `../../projects/projects/${projectName}/xrengine.config.ts`
              const config: ProjectConfigInterface = (await import(configPath)).default
              if (!config.services) return null
              return path.join(projectName, config.services as string)
            } catch (e) {
              console.log(e)
            }
          })
        )
      ).filter((hasServices) => !!hasServices)

      return (
        await Promise.all(
          servicesDirs.map(
            async (servicesDir) =>
              (await import(`../../projects/projects/${servicesDir}`)).default as (app: Application) => void
          )
        )
      ).flat()
    }
  : async () => []

const services = [
  ...ClusterServices,
  ...UserServices,
  ...ModerationServices,
  ...AssetServices,
  ...MediaServices,
  ...EntityServices,
  ...NetworkingServices,
  ...SocialServices,
  ...BotService,
  ...ScopeService,
  ...SettingService,
  ...RouteService,
  ...RecordingServices,
  ...MatchMakingServices,
  ...WorldServices,
  ...IntegrationServices
]

export default async (app: Application) => {
  const projectServices = await installedProjects()
  services.forEach((service) => app.configure(service))
  projectServices.forEach((service) => app.configure(service))
}
