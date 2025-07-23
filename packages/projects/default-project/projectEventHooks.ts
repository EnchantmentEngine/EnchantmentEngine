import { BadRequest } from '@feathersjs/errors'
import path from 'path'

import {
  locationPath,
  LocationType,
  OembedType,
  ProjectType,
  staticResourcePath,
  StaticResourceType
} from '@ir-engine/common/src/schema.type.module'
import { createLocations } from '@ir-engine/projects/createLocations'
import { ProjectEventHooks } from '@ir-engine/projects/ProjectConfigInterface'
import { Application } from '@ir-engine/server-core/declarations'

import { routePath } from '@ir-engine/common/src/schema.type.module'
import { activateRoute } from '@ir-engine/server-core/src/route/route/route'
import updateAvatarRecords from '@ir-engine/server-core/src/util/updateAvatarRecords'
import manifestJson from './manifest.json'

const avatarsFolder = path.resolve(__dirname, 'assets/avatars')

const handleOEmbedRequest = async (app: Application, project: ProjectType, url: URL, currentOEmbed: OembedType) => {
  const isLocation = /^\/location\//.test(url.pathname)
  const isAdminPanel = /^\/admin/.test(url.pathname)
  const isEditor = /^\/studio/.test(url.pathname)
  if (isLocation) {
    const locationName = url.pathname.replace(/\/location\//, '')
    const locationResult = (await app.service(locationPath).find({
      query: {
        slugifiedName: locationName
      },
      pagination: false
    } as any)) as any as LocationType[]
    if (locationResult.length === 0) throw new BadRequest('Invalid Published Space Name')
    const scene = (await app.service(staticResourcePath).get(locationResult[0].sceneId)) as StaticResourceType
    currentOEmbed.title = `${locationResult[0].name} - ${currentOEmbed.title}`
    currentOEmbed.description = `Join others in VR at ${locationResult[0].name}, directly from the web browser`
    currentOEmbed.type = 'photo'
    currentOEmbed.url = scene.thumbnailURL
    currentOEmbed.height = 320
    currentOEmbed.width = 512

    return currentOEmbed
  } else if (isAdminPanel) {
    currentOEmbed.title = `Admin Dashboard - ${currentOEmbed.title}`
    currentOEmbed.description = `Manage all aspects of your deployment. ${currentOEmbed.description}`

    return currentOEmbed
  } else if (isEditor) {
    currentOEmbed.title = `Studio - ${currentOEmbed.title}`
    currentOEmbed.description = `No need to download extra software. Create, publish, and edit your world directly in the web browser.`

    let subPath = url.pathname.replace(/\/studio\//, '')
    if (subPath.startsWith('studio')) {
      subPath = url.pathname.replace(/\/studio/, '')
    }

    if (subPath.includes('/')) {
      const locationResult = (await app.service(locationPath).find({
        query: {
          sceneId: subPath
        },
        pagination: false
      } as any)) as any as LocationType[]
      if (locationResult.length > 0) {
        const scene = (await app.service(staticResourcePath).get(locationResult[0].sceneId)) as StaticResourceType
        currentOEmbed.title = `${locationResult[0].name} Studio - ${currentOEmbed.title}`
        currentOEmbed.type = 'photo'
        currentOEmbed.url = scene.thumbnailURL
        currentOEmbed.height = 320
        currentOEmbed.width = 512
        return currentOEmbed
      }
    } else if (subPath.length > 0) {
      currentOEmbed.title = `${subPath} Editor - ${currentOEmbed.title}`
      return currentOEmbed
    }

    return null
  }
}

const config = {
  onInstall: async (app: Application) => {
    await createLocations(app, manifestJson.name, {
      apartment: 'public/scenes/apartment.gltf',
      default: 'public/scenes/default.gltf',
      ['sky-station']: 'public/scenes/sky-station.gltf',
      test: 'public/scenes/test.gltf',
      sponza: 'public/scenes/sponza.gltf'
    })

    await activateRoute(app.service(routePath))({
      project: manifestJson.name,
      route: '/banned',
      activate: true
    })
    await updateAvatarRecords(app, avatarsFolder, manifestJson.name)
  },
  onUpdate: async (app: Application) => {
    await updateAvatarRecords(app, avatarsFolder, manifestJson.name)
  },
  onOEmbedRequest: handleOEmbedRequest
  // TODO: remove avatars
  // onUninstall: (app: Application) => {
  // }
} as ProjectEventHooks

export default config
