import { ServiceInterface } from '@feathersjs/feathers/lib/declarations'
import { KnexAdapterParams } from '@feathersjs/knex'

import { staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import { recordingResourcePath } from '@ir-engine/common/src/schemas/recording/recording-resource.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'

import { Application } from '../../../declarations'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { createStaticResourceHash } from '../../media/upload-asset/upload-asset.service'

export interface RecordingResourceUploadParams extends KnexAdapterParams {}

/**
 * A class for File Browser Upload service
 */
export class RecordingResourceUploadService implements ServiceInterface<void, RecordingResourceUploadParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(data: any, params?: RecordingResourceUploadParams) {
    const { key, body, mimeType, recordingID, hash } = data

    const storageProvider = getStorageProvider()

    const uploadPromise = storageProvider.putObject({
      Key: key,
      Body: body,
      ContentType: mimeType
    })

    const localHash = hash || createStaticResourceHash(body)

    const staticResource = await this.app.service(staticResourcePath).create(
      {
        hash: localHash,
        key,
        mimeType: mimeType
      },
      { isInternal: true }
    )

    const recordingResource = await this.app.service(recordingResourcePath).create({
      recordingId: recordingID,
      staticResourceId: staticResource.id
    })

    const updatedAt = await getDateTimeSql()
    await uploadPromise

    await this.app.service(recordingResourcePath).patch(recordingResource.id, {
      updatedAt
    })
  }
}
