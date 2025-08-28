import { projectSettingMethods, projectSettingPath } from '@ir-engine/common/src/schemas/setting/project-setting.schema'
import { Application } from '@ir-engine/server-core/declarations'
import { ProjectSettingService } from './project-setting.class'
import projectSettingDocs from './project-setting.docs'
import hooks from './project-setting.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [projectSettingPath]: ProjectSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: projectSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(projectSettingPath, new ProjectSettingService(options), {
    // A list of all methods this service exposes externally
    methods: projectSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectSettingDocs
  })

  const service = app.service(projectSettingPath)
  service.hooks(hooks)
}
