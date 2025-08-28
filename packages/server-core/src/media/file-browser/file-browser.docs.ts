import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  fileBrowserContentSchema,
  fileBrowserPatchSchema,
  fileBrowserUpdateSchema
} from '@ir-engine/common/src/schemas/media/file-browser.schema'

export default createSwaggerServiceOptions({
  schemas: { fileBrowserUpdateSchema, fileBrowserPatchSchema, fileBrowserContentSchema },
  docs: {
    description: 'File Browser service description',
    securities: ['all']
  }
})
