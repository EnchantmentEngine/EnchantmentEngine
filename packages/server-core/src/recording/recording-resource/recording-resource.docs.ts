/**
 * An object for swagger documentation configuration
 */

import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  recordingResourceDataSchema,
  recordingResourcePatchSchema,
  recordingResourceQuerySchema,
  recordingResourceSchema
} from '@ir-engine/common/src/schemas/recording/recording-resource.schema'

export default createSwaggerServiceOptions({
  schemas: {
    recordingResourceDataSchema,
    recordingResourcePatchSchema,
    recordingResourceQuerySchema,
    recordingResourceSchema
  },
  docs: {
    description: 'Recording resource service description',
    securities: ['all']
  }
})
