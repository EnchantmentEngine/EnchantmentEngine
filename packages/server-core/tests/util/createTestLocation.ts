import { v4 as uuidv4 } from 'uuid'

import { LocationID, locationPath, staticResourcePath } from '@ir-engine/common/src/schema.type.module'

import { Application } from '../../declarations'

export const createTestLocation = async (app: Application, params = { isInternal: true } as any) => {
  const name = `Test Location ${uuidv4()}`

  const scene = await app.service(staticResourcePath).find({
    query: {
      key: 'projects/enchantmentengine/default-project/public/scenes/default.gltf'
    }
  })

  return await app.service(locationPath).create(
    {
      name,
      sceneId: scene.data[0].id,
      maxUsersPerInstance: 5,
      locationSetting: {
        locationType: 'public',
        audioEnabled: true,
        videoEnabled: true,
        faceStreamingEnabled: false,
        screenSharingEnabled: false,
        locationId: '' as LocationID
      },
      isLobby: false,
      isFeatured: false
    },
    { ...params }
  )
}
