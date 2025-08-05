import { AnimationClip, AnimationMixer, KeyframeTrack, Object3D, PropertyBinding } from 'three'

import { Entity, EntityUUID, iterateEntityNode, removeEntity, UndefinedEntity, UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  removeComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY, State, useHookstate } from '@ir-engine/hyperflux'
import { MaterialComponent, MaterialInstanceComponent } from '@ir-engine/spatial/src/materials/MaterialComponent'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import { useEffect } from 'react'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { AssetState } from '../../gltf/GLTFState'
import { AvatarRigComponent } from './AvatarAnimationComponent'

export const AnimationComponent = defineComponent({
  name: 'AnimationComponent',

  schema: S.Object({
    mixer: S.Type<AnimationMixer>(),
    animations: S.Array(S.Type<AnimationClip>())
  })
})

export const getEntityUUIDFromTrack = (track: KeyframeTrack) =>
  track.name.slice(0, track.name.lastIndexOf('.')) as EntityUUID

export const useLoadAnimationFromBatchGLTF = (urls: string[], keepEntities = false) => {
  const animations = urls.map((url) => useLoadAnimationFromGLTF(url, keepEntities))
  const loadedAnimations = useHookstate(null as [AnimationClip[] | null, Entity][] | null)
  useEffect(() => {
    if (loadedAnimations.value || animations.some((animation) => !animation[0].value)) return
    loadedAnimations.set(animations.map((animation) => [animation[0].get(NO_PROXY)!, animation[1]]))
  }, [animations])
  return loadedAnimations as State<[AnimationClip[] | null, Entity][]>
}

export const useLoadAnimationFromGLTF = (url: string, keepEntity = false) => {
  const assetEntity = useHookstate(UndefinedEntity)
  const animation = useHookstate(null as AnimationClip[] | null)
  const animationComponent = useOptionalComponent(assetEntity.value, AnimationComponent)
  const progress = useOptionalComponent(assetEntity.value, GLTFComponent)?.progress

  useEffect(() => {
    if (animation.value || !url) return
    if (!assetEntity.value) {
      assetEntity.set(AssetState.load(url))
    }
  }, [url, progress])

  useEffect(() => {
    if (
      !assetEntity?.value ||
      !animationComponent?.animations ||
      !animationComponent.animations.length ||
      animation.value
    )
      return
    animation.set(getComponent(assetEntity.value, AnimationComponent).animations)
    if (keepEntity) {
      iterateEntityNode(assetEntity.value, (entity) => {
        removeComponent(entity, MeshComponent)
        removeComponent(entity, SkinnedMeshComponent)
        removeComponent(entity, MaterialComponent)
        removeComponent(entity, MaterialInstanceComponent)
      })
    } else {
      removeEntity(assetEntity.value)
    }
  }, [animationComponent?.animations, assetEntity?.value])
  return [animation, keepEntity ? assetEntity?.value ?? UndefinedEntity : UndefinedEntity] as [
    State<AnimationClip[]>,
    Entity
  ]
}

PropertyBinding.parseTrackName = function (trackName) {
  const lastDotIndex = trackName.lastIndexOf('.')
  const beforeLastDot = trackName.substring(0, lastDotIndex)
  const afterLastDot = trackName.substring(lastDotIndex + 1)

  const results = {
    nodeName: beforeLastDot,
    objectName: undefined! as string,
    objectIndex: undefined! as string,
    propertyName: afterLastDot, // required
    propertyIndex: undefined! as string
  }

  if (results.propertyName === null || results.propertyName.length === 0) {
    throw new Error('PropertyBinding: can not parse propertyName from trackName: ' + trackName)
  }

  return results
}

PropertyBinding.findNode = (root: Object3D, nodeName: string) => {
  const source = UUIDComponent.getAsSourceID(root.entity)
  const childEntities = UUIDComponent.getEntitiesBySource(source)

  let entity = UndefinedEntity
  /**if AvatarRigComponent is present, use VRM schema */
  const avatarRigComponent = getOptionalComponent(root.entity!, AvatarRigComponent)
  if (avatarRigComponent) {
    entity = avatarRigComponent.bonesToEntities[nodeName]
  }
  if (!entity) entity = childEntities.find((entity) => nodeName === getComponent(entity, UUIDComponent).entityID)!

  if (!entity) {
    return null
  }

  return (
    getOptionalComponent(entity, BoneComponent) ||
    getOptionalComponent(entity, MeshComponent) ||
    getOptionalComponent(entity, ObjectComponent)!
  )
}
