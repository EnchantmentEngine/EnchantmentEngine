import { fileBrowserMethods, fileBrowserPath } from '@ir-engine/common/src/schemas/media/file-browser.schema'

import { Application } from '../../../declarations'
import { FileBrowserService } from './file-browser.class'
import fileBrowserDocs from './file-browser.docs'
import hooks from './file-browser.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [fileBrowserPath]: FileBrowserService
  }
}

export default (app: Application): void => {
  app.use(fileBrowserPath, new FileBrowserService(app), {
    // A list of all methods this service exposes externally
    methods: fileBrowserMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: fileBrowserDocs
  })

  const service = app.service(fileBrowserPath)
  service.hooks(hooks)
}
