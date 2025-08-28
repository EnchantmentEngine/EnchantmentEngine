import { recordingMethods, recordingPath } from '@ir-engine/common/src/schemas/recording/recording.schema'

import { Application } from '../../../declarations'
import { RecordingService } from './recording.class'
import recordingDocs from './recording.docs'
import hooks from './recording.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [recordingPath]: RecordingService
  }
}

export default (app: Application): void => {
  const options = {
    name: recordingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(recordingPath, new RecordingService(options), {
    // A list of all methods this service exposes externally
    methods: recordingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: recordingDocs
  })

  const service = app.service(recordingPath)
  service.hooks(hooks)
}
