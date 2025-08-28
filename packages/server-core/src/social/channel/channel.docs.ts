/**
 * An object for swagger documentation configuration
 */

import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  recordingDataSchema,
  recordingPatchSchema,
  recordingQuerySchema,
  recordingSchema
} from '@ir-engine/common/src/schemas/recording/recording.schema'

export default createSwaggerServiceOptions({
  schemas: {
    recordingDataSchema,
    recordingPatchSchema,
    recordingQuerySchema,
    recordingSchema
  },
  docs: {
    description: 'Channel service description',
    securities: ['all']
  }
})
