import {
  projectInvalidateMethods,
  projectInvalidatePath
} from '@ir-engine/common/src/schemas/projects/project-invalidate.schema'

import { Application } from '../../../declarations'
import { ProjectInvalidateService } from './project-invalidate.class'
import projectInvalidateDocs from './project-invalidate.docs'
import hooks from './project-invalidate.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectInvalidatePath]: ProjectInvalidateService
  }
}

export default (app: Application): void => {
  app.use(projectInvalidatePath, new ProjectInvalidateService(app), {
    // A list of all methods this service exposes externally
    methods: projectInvalidateMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectInvalidateDocs
  })

  const service = app.service(projectInvalidatePath)
  service.hooks(hooks)
}
