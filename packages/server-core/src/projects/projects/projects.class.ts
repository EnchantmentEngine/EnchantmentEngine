import { ServiceInterface } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { ProjectType } from '@ir-engine/common/src/schemas/projects/project.schema'

import { Application } from '../../../declarations'

const projectsRootFolder = path.join(appRootPath.path, 'packages/projects/projects/')

export class ProjectsService implements ServiceInterface<ProjectType['name'][]> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * returns a list of projects installed by name from their folder names
   */
  async find() {
    return fs
      .readdirSync(projectsRootFolder, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .map((orgname) => {
        return fs
          .readdirSync(path.join(projectsRootFolder, orgname), { withFileTypes: true })
          .filter(
            (dirent) =>
              dirent.isDirectory() &&
              fs.existsSync(path.join(projectsRootFolder, orgname, dirent.name, 'xrengine.config.ts'))
          )
          .map((dirent) => `${orgname}/${dirent.name}`)
      })
      .flat()
  }
}
