import { StaticResourceType, invalidationPath, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { FileToAssetType } from '@ir-engine/spatial/src/resources/AssetType'
import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getStats } from '../static-resource/static-resource-helper'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { createStaticResourceHash } from '../upload-asset/upload-asset.service'

type StaticResourceUploadArgs = {
  key: string
  body: Buffer
  contentType: string
  project?: string
  id?: string
  type?: string
  tags?: string[]
  dependencies?: string[]
  attribution?: string
  licensing?: string
  description?: string
  thumbnailKey?: string | null
  thumbnailMode?: string | null
}

export const uploadStaticResource = async (app: Application, args: StaticResourceUploadArgs) => {
  const { key, project, body, contentType, id, ...data } = args

  const storageProvider = getStorageProvider()

  const assetClass = FileToAssetType(key)
  const stats = await getStats(body, contentType)
  const hash = createStaticResourceHash(body)

  await storageProvider.putObject(
    {
      Key: key,
      Body: body,
      ContentType: contentType
    },
    {
      isDirectory: false
    }
  )

  let staticResource: StaticResourceType

  if (id) {
    staticResource = await app.service(staticResourcePath).patch(
      id,
      {
        key,
        hash,
        project,
        mimeType: contentType,
        stats,
        type: data.type,
        tags: data.tags ?? [assetClass],
        dependencies: data.dependencies,
        licensing: data.licensing,
        description: data.description,
        attribution: data.attribution,
        thumbnailKey: data.thumbnailKey,
        thumbnailMode: data.thumbnailMode
      },
      { isInternal: true }
    )
  } else {
    staticResource = await app.service(staticResourcePath).create(
      {
        key,
        hash,
        mimeType: contentType,
        project,
        stats,
        type: data.type,
        tags: data.tags ?? [assetClass],
        dependencies: data.dependencies,
        licensing: data.licensing,
        description: data.description,
        attribution: data.attribution,
        thumbnailKey: data.thumbnailKey,
        thumbnailMode: data.thumbnailMode
      },
      { isInternal: true }
    )
  }

  if (config.server.edgeCachingEnabled)
    await app.service(invalidationPath).create({
      path: key
    })

  return staticResource
}
