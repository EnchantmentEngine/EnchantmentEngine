import {
  projectBuilderTagsMethods,
  projectBuilderTagsPath
} from '@ir-engine/common/src/schemas/projects/project-builder-tags.schema'

import { Application } from '../../../declarations'
import { ProjectBuilderTagsService } from './project-builder-tags.class'
import projectBuilderTagsDocs from './project-builder-tags.docs'
import hooks from './project-builder-tags.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectBuilderTagsPath]: ProjectBuilderTagsService
  }
}

export default (app: Application): void => {
  app.use(projectBuilderTagsPath, new ProjectBuilderTagsService(app), {
    // A list of all methods this service exposes externally
    methods: projectBuilderTagsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectBuilderTagsDocs
  })

  const service = app.service(projectBuilderTagsPath)
  service.hooks(hooks)
}
