import { useFind, useGet } from '@ir-engine/common'
import { config } from '@ir-engine/common/src/config'
import { UserID, avatarPath, userAvatarPath } from '@ir-engine/common/src/schema.type.module'

export const DEFAULT_PROFILE_IMG_PLACEHOLDER = `${config.client.fileServer}/projects/EnchantmentEngine/default-project/assets/default-silhouette.svg`

export const useUserAvatarThumbnail = (userId?: UserID) => {
  const userAvatar = useFind(userAvatarPath, {
    query: {
      userId
    }
  })

  const avatar = useGet(avatarPath, userAvatar.data?.[0]?.avatarId)
  return avatar.data?.thumbnailResource?.url ?? DEFAULT_PROFILE_IMG_PLACEHOLDER
}
