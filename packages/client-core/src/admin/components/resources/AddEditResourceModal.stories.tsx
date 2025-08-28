import { StaticResourceType } from '@ir-engine/common/src/schema.type.module'
import AddEditResourceModal from './AddEditResourceModal'

export default {
  title: 'Client/AddEditResourceModal',
  component: AddEditResourceModal,
  parameters: {
    componentSubtitle: 'AddEditResourceModal',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    selectedResource: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      key: 'resource-key',
      mimeType: 'image/png',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      hash: 'abcdef123456',
      type: 'thumbnail',
      project: 'project-name',
      tags: ['tag1', 'tag2'],
      dependencies: ['dep1', 'dep2'],
      attribution: 'Author Name',
      licensing: 'MIT',
      description: 'A sample static resource',
      name: 'Sample Resource',
      url: 'https://example.com/resource.png',
      stats: { size: 1024 },
      thumbnailKey: 'thumb-key',
      thumbnailURL: 'https://example.com/thumb.png',
      thumbnailMode: 'automatic',
      updatedBy: '123e4567-e89b-12d3-a456-426614174002',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as unknown as StaticResourceType
  }
}
