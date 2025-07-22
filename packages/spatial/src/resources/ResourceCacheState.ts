import { Entity } from '@ir-engine/ecs'
import { defineState } from '@ir-engine/hyperflux'
import { ResourceType } from './ResourceState'

// Apply texture memory management patch
import { applyTexturePatch } from './loaders/texture/TexturePatch'

try {
  // Apply the texture patch directly - simpler and more direct
  applyTexturePatch()
  // console.log('Texture memory management patch applied')
} catch (e) {
  console.error('Error applying texture memory patch:', e)
}

export const ResourceStatus = {
  Unloaded: 0,
  Loading: 1,
  Loaded: 2,
  Error: 3
} as const

export type ResourceStatusType = (typeof ResourceStatus)[keyof typeof ResourceStatus]

export const ResourceCacheState = defineState({
  name: 'ResourceCacheState',
  initial: {} as Record<
    string,
    {
      id: string
      asset: unknown
      status: ResourceStatusType
      type: ResourceType
      references: Entity[]
      metadata: Record<string, any>
    }
  >
})
