import {
  userRelationshipTypeMethods,
  userRelationshipTypePath
} from '@ir-engine/common/src/schemas/user/user-relationship-type.schema'

import { Application } from '../../../declarations'
import { UserRelationshipTypeService } from './user-relationship-type.class'
import userRelationshipTypeDocs from './user-relationship-type.docs'
import hooks from './user-relationship-type.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [userRelationshipTypePath]: UserRelationshipTypeService
  }
}

export default (app: Application): void => {
  const options = {
    id: 'type',
    name: userRelationshipTypePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(userRelationshipTypePath, new UserRelationshipTypeService(options), {
    // A list of all methods this service exposes externally
    methods: userRelationshipTypeMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: userRelationshipTypeDocs
  })

  const service = app.service(userRelationshipTypePath)
  service.hooks(hooks)
}
