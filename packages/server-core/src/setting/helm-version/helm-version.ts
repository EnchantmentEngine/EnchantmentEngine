import { helmVersionMethods, helmVersionPath } from '@ir-engine/common/src/schemas/setting/helm-version.schema'
import { Application } from '../../../declarations'
import { HelmVersionService } from './helm-version.class'
import helmVersionDocs from './helm-version.docs'
import hooks from './helm-version.hooks'
declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [helmVersionPath]: HelmVersionService
  }
}

export default (app: Application): void => {
  app.use(helmVersionPath, new HelmVersionService(), {
    methods: helmVersionMethods,
    events: [],
    docs: helmVersionDocs
  })
  const service = app.service(helmVersionPath)
  service.hooks(hooks)
}
