import { LocationID } from '@ir-engine/common/src/schemas/social/location.schema'

import { Application } from '../../../declarations'
import hooks from './instanceserver-load.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    'instanceserver-load': any
  }
}

export default (app: Application): void => {
  app.use('instanceserver-load', {
    patch: ({
      id,
      ipAddress,
      podName,
      locationId,
      sceneId
    }: {
      id
      ipAddress
      podName
      locationId: LocationID
      sceneId: string
    }) => {
      return { id, ipAddress, podName, locationId, sceneId }
    }
  })

  const service = app.service('instanceserver-load')

  service.hooks(hooks)
}
