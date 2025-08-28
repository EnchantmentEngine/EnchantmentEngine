import { ServiceInterface } from '@feathersjs/feathers/lib/declarations'
import { KnexAdapterParams } from '@feathersjs/knex'

import { UploadFile } from '@ir-engine/common/src/interfaces/UploadAssetInterface'

import { moderationAttachmentPath } from '@ir-engine/common/src/schemas/moderation/moderation-attachment.schema'
import { Application } from '../../../declarations'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { StorageObjectInterface } from '../../media/storageprovider/storageprovider.interface'

export interface ModerationFileUploadParams extends KnexAdapterParams {
  files: UploadFile[]
}

export class ModerationFileUploadService implements ServiceInterface<string[], any, ModerationFileUploadParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(rawData: { args: string }, params: ModerationFileUploadParams) {
    const data = typeof rawData.args === 'string' ? JSON.parse(rawData.args) : rawData.args
    const storageProvider = getStorageProvider()
    const isCreated = await storageProvider.putObject({ Key: 'reports' } as StorageObjectInterface, {
      isDirectory: true
    })
    const result = (
      await Promise.all(
        params.files.map(async (file, i) => {
          const args = data[i]
          const reportFilePath = `/reports/${args.moderationId}/${file.originalname}`
          const response = await storageProvider.putObject({
            Key: reportFilePath,
            Body: file.buffer,
            ContentType: file.mimetype
          })
          this.app.service(moderationAttachmentPath).create({
            moderationId: args.moderationId,
            filePath: response == true ? reportFilePath : '',
            fileName: file.originalname
          })
          return response == true ? reportFilePath : ``
        })
      )
    ).map((result) => result)
    // Clear params otherwise all the files and auth details send back to client as  response
    for (const prop of Object.getOwnPropertyNames(params)) delete params[prop]

    return result
  }
}
