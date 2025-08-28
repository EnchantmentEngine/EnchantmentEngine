import { ServiceInterface } from '@feathersjs/feathers/lib/declarations'
import { KnexAdapterParams } from '@feathersjs/knex'

import { UploadFile } from '@ir-engine/common/src/interfaces/UploadAssetInterface'
import { fileBrowserPath } from '@ir-engine/common/src/schemas/media/file-browser.schema'

import { Application } from '../../../declarations'

export interface FileBrowserUploadParams extends KnexAdapterParams {
  files: UploadFile[]
}

/**
 * A class for File Browser Upload service
 */
export class FileBrowserUploadService implements ServiceInterface<string[], any, FileBrowserUploadParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(rawData: { args: string }, params: FileBrowserUploadParams) {
    const data = typeof rawData.args === 'string' ? JSON.parse(rawData.args) : rawData.args
    const result = (
      await Promise.all(
        params.files.map((file, i) => {
          const args = data[i]
          return this.app.service(fileBrowserPath).patch(null, {
            ...args,
            project: args.project,
            path: args.path,
            body: file.buffer as Buffer,
            contentType: args.contentType || file.mimetype
          })
        })
      )
    ).map((result) => result.url)

    // Clear params otherwise all the files and auth details send back to client as  response
    for (const prop of Object.getOwnPropertyNames(params)) delete params[prop]

    return result
  }
}
