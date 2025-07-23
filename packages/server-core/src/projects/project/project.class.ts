import { Params } from '@feathersjs/feathers'
import { KnexAdapterOptions, KnexAdapterParams, KnexService } from '@feathersjs/knex'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { DefaultUpdateSchedule } from '@ir-engine/common/src/interfaces/ProjectPackageJsonType'
import {
  ScopeData,
  ScopeType,
  projectPermissionPath,
  scopePath,
  staticResourcePath
} from '@ir-engine/common/src/schema.type.module'
import { ProjectBuildUpdateItemType } from '@ir-engine/common/src/schemas/projects/project-build.schema'
import {
  ProjectData,
  ProjectPatch,
  ProjectQuery,
  ProjectType,
  ProjectUpdateParams
} from '@ir-engine/common/src/schemas/projects/project.schema'
import { getDateTimeSql, toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { getState } from '@ir-engine/hyperflux'

import { isDev } from '@ir-engine/common/src/config'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { ServerMode, ServerState } from '../../ServerState'
import config from '../../appconfig'
import { createStaticResourceHash } from '../../media/upload-asset/upload-asset.service'
import {
  deleteProjectFilesInStorageProvider,
  engineVersion,
  getCommitSHADate,
  getGitProjectData,
  getProjectConfig,
  getProjectEnabled,
  getProjectManifest,
  onProjectEvent,
  uploadLocalProjectToProvider
} from './project-helper'

const UPDATE_JOB_TIMEOUT = 60 * 5 //5 minute timeout on project update jobs completing or failing

const projectsRootFolder = path.join(appRootPath.path, 'packages/projects/projects/')

export interface ProjectParams extends KnexAdapterParams<ProjectQuery>, ProjectUpdateParams {
  appJWT?: string
  isDependency?: boolean
}

export type ProjectParamsClient = Omit<ProjectParams, 'user'>

export class ProjectService<T = ProjectType, ServiceParams extends Params = ProjectParams> extends KnexService<
  ProjectType,
  ProjectData | ProjectBuildUpdateItemType,
  ProjectParams,
  ProjectPatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async _seedProject(projectName: string): Promise<any> {
    logger.warn('[Projects]: Found new locally installed project: ' + projectName)
    const projectConfig = await getProjectConfig(projectName)
    const enabled = getProjectEnabled(projectName)

    // if no manifest.json exists, add one
    const packageJsonPath = path.resolve(projectsRootFolder, projectName, 'package.json')
    const manifestJsonPath = path.resolve(projectsRootFolder, projectName, 'manifest.json')
    if (!fs.existsSync(manifestJsonPath) && fs.existsSync(packageJsonPath)) {
      const json = getProjectManifest(projectName)
      fs.writeFileSync(manifestJsonPath, JSON.stringify(json, null, 2))
      const sceneJsonFiles = fs
        .readdirSync(path.resolve(projectsRootFolder, projectName))
        .filter((file) => file.endsWith('.scene.json'))
      for (const scene of sceneJsonFiles) {
        const sceneName = scene.split('/').pop()!.replace('.scene.json', '')
        await this.app.service(staticResourcePath).create({
          key: `projects/${projectName}/${sceneName}`,
          mimeType: 'application/json',
          hash: createStaticResourceHash(fs.readFileSync(scene)),
          project: projectName,
          type: 'scene',
          thumbnailKey: `projects/${projectName}/${sceneName.replace('.scene.json', '.thumbnail.jpg')}`
        })
      }
    }

    const gitData = getGitProjectData(projectName)
    const { commitSHA, commitDate } = await getCommitSHADate(projectName)

    const project = await super._create({
      id: uuidv4(),
      name: projectName,
      enabled,
      repositoryPath: gitData.repositoryPath,
      sourceRepo: gitData.sourceRepo,
      sourceBranch: gitData.sourceBranch,
      commitSHA,
      commitDate: toDateTimeSql(commitDate),
      needsRebuild: true,
      hasLocalChanges: false,
      updateType: 'none' as ProjectType['updateType'],
      updateSchedule: DefaultUpdateSchedule,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    })

    await uploadLocalProjectToProvider(this.app, projectName)

    // run project install script
    if (projectConfig?.onEvent) {
      await onProjectEvent(this.app, project, projectConfig.onEvent, 'onInstall')
    }

    // if in dev mode, give all admins access to the project
    if (isDev) {
      const admins = (await this.app
        .service(scopePath)
        .find({ query: { type: 'static_resource:write' as ScopeType, paginate: false } })) as any as ScopeData[]
      for (const admin of admins) {
        await this.app.service(projectPermissionPath).create({
          projectId: project.id,
          userId: admin.userId,
          type: 'owner'
        })
      }
    }

    return Promise.resolve()
  }

  /**
   * On dev, sync the db with any projects installed locally
   */
  async _syncDevLocalProjects() {
    if (getState(ServerState).serverMode !== ServerMode.API) return

    const data = (await super._find({ paginate: false })) as ProjectType[]

    if (!fs.existsSync(projectsRootFolder)) {
      fs.mkdirSync(projectsRootFolder, { recursive: true })
    }

    // projects now take the form <orgname/projectname>
    const locallyInstalledProjects = fs
      .readdirSync(projectsRootFolder, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .map((orgname) => {
        return fs
          .readdirSync(path.join(projectsRootFolder, orgname), { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => `${orgname}/${dirent.name}`)
      })
      .flat()

    const promises: Promise<any>[] = []

    for (const projectName of locallyInstalledProjects) {
      let seeded = false
      if (!data.find((e) => e.name === projectName)) {
        seeded = true
        try {
          promises.push(this._seedProject(projectName))
        } catch (e) {
          logger.error(e)
        }
      } else {
        /**@todo call onUpdate for project */
      }

      const { commitSHA, commitDate } = await getCommitSHADate(projectName)

      const projectEngineVersion = getProjectManifest(projectName).engineVersion
      const enabled = config.allowOutOfDateProjects ? true : projectEngineVersion === engineVersion

      await super._patch(
        null,
        { enabled, commitSHA, commitDate: toDateTimeSql(commitDate) },
        { query: { name: projectName } }
      )

      if (!seeded) promises.push(uploadLocalProjectToProvider(this.app, projectName))
    }

    await Promise.all(promises)

    /** if a project was removed locally, remove it from the db */
    if (config.fsProjectSyncEnabled)
      for (const { name, id } of data) {
        if (!locallyInstalledProjects.includes(name)) {
          await deleteProjectFilesInStorageProvider(this.app, name)
          logger.warn(`[Projects]: Project ${name} not found, assuming removed`)
          await super._remove(id)
        }
      }
  }
}
