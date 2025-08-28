import { SystemDefinitions } from '@ir-engine/ecs'
import { startReactor } from '@ir-engine/hyperflux'
import { AvatarAnimationSystem } from '../src/avatar/systems/AvatarAnimationSystem'
import { GLTFLoadSystem } from '../src/gltf/GLTFState'

const gltfLoadSystem = SystemDefinitions.get(GLTFLoadSystem)!

export const startAssetReactor = () => {
  startReactor(gltfLoadSystem.reactor!)
}

const avatarAnimationSystem = SystemDefinitions.get(AvatarAnimationSystem)!

export const startAvatarReactor = () => {
  // depends on asset module
  startReactor(avatarAnimationSystem.reactor!)
}

export const startEngineReactor = () => {
  startAssetReactor()
  startAvatarReactor()
}
