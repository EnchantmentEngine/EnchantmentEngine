import {
  recordingResourceUploadMethods,
  recordingResourceUploadPath
} from '@ir-engine/common/src/schemas/recording/recording-resource-upload.schema'

import { Application } from '../../../declarations'
import { RecordingResourceUploadService } from './recording-resource-upload.class'
import RecordingResourceUploadDocs from './recording-resource-upload.docs'
import hooks from './recording-resource-upload.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [recordingResourceUploadPath]: RecordingResourceUploadService
  }
}

export default (app: Application): void => {
  app.use(recordingResourceUploadPath, new RecordingResourceUploadService(app), {
    // A list of all methods this service exposes externally
    methods: recordingResourceUploadMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: RecordingResourceUploadDocs
  })

  const service = app.service(recordingResourceUploadPath)
  service.hooks(hooks)
}
