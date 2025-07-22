import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { AvatarID, avatarPath } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { CommonKnownContentTypes } from '@ir-engine/common/src/utils/CommonKnownContentTypes'

import { staticResourcePath, StaticResourceType } from '@ir-engine/common/src/schema.type.module'
import { cleanFileNameString } from '@ir-engine/common/src/utils/cleanFileName'
import { Application } from '../../../declarations'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { UploadParams } from '../../media/upload-asset/upload-asset.service'
import logger from '../../ServerLogger'

const getAvatarDependencies = async (resourceKey: string) => {
  const fileExtension = resourceKey.split('.').pop()!
  if (fileExtension !== 'gltf') return [] // only gltf files have dependencies

  const resourceFolder = resourceKey.split('/').slice(0, -1).join('/')
  const avatarName = resourceKey.split('/').pop()!.split('.')[0]
  const storageProvider = getStorageProvider()
  const hasRelativePath = await storageProvider.isDirectory(avatarName, resourceFolder)
  if (!hasRelativePath) return [] // no dependencies by folder name convention - TODO support other conventions

  const dependencies = await storageProvider.listObjects(resourceFolder + '/' + avatarName)
  return dependencies.Contents.map((dependency) => dependency.Key)
}

export const patchStaticResourceAsAvatar = async (app: Application, projectName: string, resourceKey: string) => {
  const cleanResourceKey = cleanFileNameString(resourceKey)
  const staticResourceQuery = await app.service(staticResourcePath).find({
    query: {
      key: cleanResourceKey
    }
  })
  if (!staticResourceQuery.data || staticResourceQuery.data.length === 0)
    throw new Error('Static resource not found for key ' + cleanResourceKey)

  const staticResource = staticResourceQuery.data[0]

  const thumbnailPath = cleanResourceKey.split('.').slice(0, -1).join('.') + '.png'
  const thumbnailResourceQuery = await app.service(staticResourcePath).find({
    query: {
      key: thumbnailPath
    }
  })

  const thumbnailStaticResource = thumbnailResourceQuery.data[0] as StaticResourceType | undefined

  const existingAvatar = await app.service(avatarPath).find({
    query: {
      modelResourceId: staticResourceQuery.data[0].id
    }
  })

  if (existingAvatar.data.length > 0) {
    await app.service(avatarPath).patch(existingAvatar.data[0].id, {
      modelResourceId: staticResource.id,
      thumbnailResourceId: thumbnailStaticResource?.id || undefined
    })
  } else {
    await app.service(avatarPath).create({
      name: cleanResourceKey.split('/').pop()!.split('.')[0],
      modelResourceId: staticResource.id,
      thumbnailResourceId: thumbnailStaticResource?.id || undefined,
      isPublic: true,
      project: projectName || undefined
    })
  }

  const dependencies = await getAvatarDependencies(cleanResourceKey)
  await app.service(staticResourcePath).patch(staticResource.id, {
    type: 'avatar',
    dependencies: [...dependencies, ...(thumbnailStaticResource ? [thumbnailStaticResource.key] : [])]
  })
  if (thumbnailStaticResource) {
    await app.service(staticResourcePath).patch(thumbnailStaticResource.id, {
      type: 'thumbnail'
    })
  }
}

export type AvatarUploadArguments = {
  avatar: Buffer
  thumbnail: Buffer
  avatarName: string
  isPublic: boolean
  avatarFileType?: string
  avatarId?: AvatarID
  project?: string
  path?: string
}

// todo: move this somewhere else
export const supportedAvatars = ['glb', 'gltf', 'vrm']
const projectsPath = path.join(appRootPath.path, '/packages/projects/')

/**
 * @todo - reference dependency files in static resources?
 * @param app
 * @param avatarsFolder
 * @deprecated
 */
export const installAvatarsFromProject = async (app: Application, avatarsFolder: string) => {
  // TODO backcompat
  const projectName = avatarsFolder.replace(path.join(projectsPath + '/projects/'), '').split('/')[0]
  return Promise.all(
    fs
      .readdirSync(avatarsFolder)
      .filter((file) => supportedAvatars.includes(file.split('.').pop()!))
      .map((file) => {
        return patchStaticResourceAsAvatar(
          app,
          projectName,
          path.resolve(avatarsFolder, file).replace(projectsPath, '')
        )
      })
  )
}

export const uploadAvatarStaticResource = async (
  app: Application,
  data: AvatarUploadArguments,
  params?: UploadParams
) => {
  if (!data.avatar) throw new Error('No avatar model found')
  if (!data.thumbnail) throw new Error('No thumbnail found')

  const name = data.avatarName ? data.avatarName : 'Avatar-' + Math.round(Math.random() * 100000)

  const staticResourceKey = `avatars/${data.isPublic ? 'public' : params?.user!.id}/`
  const userID = params?.user!.id
  const isFromDomain = !!data.path
  const folderName = isFromDomain ? data.path! : staticResourceKey

  delete params?.provider
  const modelKey = path.join(folderName, `${name}.${data.avatarFileType ?? 'glb'}`)
  const thumbnailKey = path.join(folderName, `${name}.png`)

  const storageProvider = getStorageProvider()

  await Promise.all([
    storageProvider.putObject({
      Body: data.avatar,
      Key: modelKey,
      ContentType: CommonKnownContentTypes[data.avatarFileType ?? 'glb']
    }),
    storageProvider.putObject({
      Body: data.thumbnail,
      Key: thumbnailKey,
      ContentType: CommonKnownContentTypes.png
    })
  ])

  const [modelResource, thumbnailResource] = await Promise.all([
    app.service(staticResourcePath).create(
      {
        key: modelKey,
        type: 'avatar',
        dependencies: [thumbnailKey],
        userId: userID,
        project: data.project
      },
      params
    ),
    app.service(staticResourcePath).create(
      {
        key: thumbnailKey,
        userId: userID,
        type: 'thumbnail',
        project: data.project
      },
      params
    )
  ])

  logger.info('Successfully uploaded avatar %o %o', modelResource, thumbnailResource)

  if (data.avatarId) {
    try {
      await app.service(avatarPath).patch(data.avatarId, {
        modelResourceId: modelResource.id,
        thumbnailResourceId: thumbnailResource.id
      })
    } catch (err) {
      console.log(err)
    }
  }

  return [modelResource, thumbnailResource]
}
