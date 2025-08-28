import { AvatarType } from '@ir-engine/common/src/schemas/user/avatar.schema'
import AddEditAvatarModal from './AddEditAvatarModal'

export default {
  title: 'Client/AddEditAvatarModal',
  component: AddEditAvatarModal,
  parameters: {
    componentSubtitle: 'AddEditAvatarModal',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    avatar: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Sample Avatar',
      identifierName: 'sample_avatar',
      modelResourceId: '123e4567-e89b-12d3-a456-426614174001',
      thumbnailResourceId: '123e4567-e89b-12d3-a456-426614174002',
      isPublic: true,
      userId: '123e4567-e89b-12d3-a456-426614174003',
      project: 'Sample Project',
      user: null,
      modelResource: null,
      thumbnailResource: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as unknown as AvatarType
  }
}
