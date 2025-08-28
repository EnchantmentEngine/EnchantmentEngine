import { builderInfoMethods, builderInfoPath } from '@ir-engine/common/src/schemas/projects/builder-info.schema'

import { Application } from '../../../declarations'
import { BuilderInfoService } from './builder-info.class'
import builderInfoDocs from './builder-info.docs'
import hooks from './builder-info.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [builderInfoPath]: BuilderInfoService
  }
}

export default (app: Application): void => {
  app.use(builderInfoPath, new BuilderInfoService(app), {
    // A list of all methods this service exposes externally
    methods: builderInfoMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: builderInfoDocs
  })

  const service = app.service(builderInfoPath)
  service.hooks(hooks)
}
