import { AvatarID } from '@ir-engine/common/src/schema.type.module'

import { UserID } from '@ir-engine/hyperflux'

export type AvatarUploadArgsType = {
  avatarName: string
  avatarId: AvatarID
  isPublic: boolean
}

export type AvatarUploadType = {
  type: 'user-avatar-upload'
  files: (Blob | Buffer)[]
  userId?: UserID
  path?: string
  args: string | AvatarUploadArgsType
}

export type AdminAssetUploadArgumentsType = {
  id?: string
  path: string
  userId?: UserID
  name?: string
  project?: string
  hash?: string
}

export type AdminAssetUploadType = {
  type: 'admin-file-upload'
  project: string
  files: Blob[]
  args: AdminAssetUploadArgumentsType
  variants: boolean
  userId?: UserID
}

export type AssetUploadType = AvatarUploadType | AdminAssetUploadType

export interface UploadFile {
  fieldname?: string
  originalname: string
  encoding?: string
  mimetype: string
  buffer: Buffer
  size: number
}
