import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  podsSchema,
  serverContainerInfoSchema,
  serverPodInfoSchema
} from '@ir-engine/common/src/schemas/cluster/pods.schema'

export default createSwaggerServiceOptions({
  schemas: { podsSchema, serverPodInfoSchema, serverContainerInfoSchema },
  docs: {
    description: 'Pods service description',
    securities: ['all']
  }
})
