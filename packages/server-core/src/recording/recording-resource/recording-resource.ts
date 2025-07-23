import {
  recordingResourceMethods,
  recordingResourcePath
} from '@ir-engine/common/src/schemas/recording/recording-resource.schema'

import { Application } from '../../../declarations'
import { RecordingResourceService } from './recording-resource.class'
import recordingResourceDocs from './recording-resource.docs'
import hooks from './recording-resource.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [recordingResourcePath]: RecordingResourceService
  }
}

export default (app: Application): void => {
  const options = {
    name: recordingResourcePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(recordingResourcePath, new RecordingResourceService(options), {
    // A list of all methods this service exposes externally
    methods: recordingResourceMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: recordingResourceDocs
  })

  const service = app.service(recordingResourcePath)
  service.hooks(hooks)
}
