import {
  instanceAttendanceMethods,
  instanceAttendancePath
} from '@ir-engine/common/src/schemas/networking/instance-attendance.schema'

import { Application } from '../../../declarations'
import { InstanceAttendanceService } from './instance-attendance.class'
import instanceAttendanceDocs from './instance-attendance.docs'
import hooks from './instance-attendance.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [instanceAttendancePath]: InstanceAttendanceService
  }
}

export default (app: Application) => {
  const options = {
    name: instanceAttendancePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(instanceAttendancePath, new InstanceAttendanceService(options), {
    // A list of all methods this service exposes externally
    methods: instanceAttendanceMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: instanceAttendanceDocs
  })

  const service = app.service(instanceAttendancePath)
  service.hooks(hooks)
}
