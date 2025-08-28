import {
  projectBranchesMethods,
  projectBranchesPath
} from '@ir-engine/common/src/schemas/projects/project-branches.schema'

import { Application } from '../../../declarations'
import { ProjectBranchesService } from './project-branches.class'
import projectBranchesDocs from './project-branches.docs'
import hooks from './project-branches.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectBranchesPath]: ProjectBranchesService
  }
}

export default (app: Application): void => {
  app.use(projectBranchesPath, new ProjectBranchesService(app), {
    // A list of all methods this service exposes externally
    methods: projectBranchesMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectBranchesDocs
  })

  const service = app.service(projectBranchesPath)
  service.hooks(hooks)
}
