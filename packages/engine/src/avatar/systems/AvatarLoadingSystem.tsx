import React, { useEffect } from 'react'
import { SRGBColorSpace } from 'three'

import { createEntity, useEntityContext } from '@ir-engine/ecs'
import { getComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { QueryReactor, defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getMutableState, getState, isClient, useHookstate } from '@ir-engine/hyperflux'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { iOS } from '@ir-engine/spatial/src/common/functions/isMobile'
import { useTexture } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { AnimationState } from '../AnimationManager'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarDissolveComponent } from '../components/AvatarDissolveComponent'
import { SpawnEffectComponent } from '../components/SpawnEffectComponent'
import { AvatarAnimationSystem } from './AvatarAnimationSystem'

const lightScale = (y, r) => {
  return Math.min(1, Math.max(1e-3, y / r))
}

const lightOpacity = (y, r) => {
  return Math.min(1, Math.max(0, 1 - (y - r) * 0.5))
}

const growQuery = defineQuery([SpawnEffectComponent])
const dissolveQuery = defineQuery([AvatarDissolveComponent])

const execute = () => {
  const delta = getState(ECSState).deltaSeconds

  for (const entity of growQuery()) {
    TransformComponent.dirty[entity] = 1

    const { opacityMultiplier, plateEntity, lightEntities } = getComponent(entity, SpawnEffectComponent)
    if (!plateEntity) continue

    const plate = getComponent(plateEntity, ObjectComponent) as typeof SpawnEffectComponent.plateMesh
    plate.material.opacity = opacityMultiplier * (0.7 + 0.5 * Math.sin((Date.now() % 6283) * 5e-3))

    for (const rayEntity of lightEntities) {
      const ray = getComponent(rayEntity, ObjectComponent) as typeof SpawnEffectComponent.lightMesh
      const rayTransform = getComponent(rayEntity, TransformComponent)
      rayTransform.position.y += 2 * delta
      rayTransform.scale.y = lightScale(rayTransform.position.y, ray.geometry.boundingSphere!.radius)
      ray.material.opacity = lightOpacity(rayTransform.position.y, ray.geometry.boundingSphere!.radius)

      if (ray.material.opacity < 1e-3) {
        rayTransform.position.y = plate.position.y
      }
      ray.material.opacity *= opacityMultiplier
    }
  }

  for (const entity of dissolveQuery()) {
    const effectComponent = getComponent(entity, AvatarDissolveComponent)
    AvatarDissolveComponent.updateDissolveEffect(effectComponent.dissolveMaterials, entity, delta)
  }
}

const AvatarPendingReactor = () => {
  const entity = useEntityContext()

  const gltf = useComponent(entity, GLTFComponent)

  useEffect(() => {
    if (gltf.progress === 100) return

    const loadingEffect = !getState(XRState).sessionActive && !iOS

    if (!isClient || !loadingEffect) return

    const avatarHeight = getComponent(entity, AvatarComponent).avatarHeight
    setComponent(entity, AvatarDissolveComponent, { height: avatarHeight })

    const effectEntity = createEntity()
    setComponent(effectEntity, SpawnEffectComponent, {
      sourceEntity: entity,
      opacityMultiplier: 1
    })

    return () => {
      SpawnEffectComponent.fadeOut(effectEntity)
    }
  }, [gltf.progress])

  return null
}

const LoadingAssetReactor = () => {
  const assetsReady = useHookstate(false)

  const [itemLight] = useTexture('/static/itemLight.png')
  const [itemPlate] = useTexture('/static/itemPlate.png')

  useEffect(() => {
    const texture = itemLight
    if (!texture) return

    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    SpawnEffectComponent.lightMesh.material.map = texture
  }, [itemLight])

  useEffect(() => {
    const texture = itemPlate
    if (!texture) return

    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    SpawnEffectComponent.plateMesh.material.map = texture
  }, [itemPlate])

  useEffect(() => {
    if (itemLight && itemPlate) assetsReady.set(true)
  }, [itemLight, itemPlate])

  useEffect(() => {
    SpawnEffectComponent.lightMesh.geometry.computeBoundingSphere()
    SpawnEffectComponent.plateMesh.geometry.computeBoundingSphere()
    SpawnEffectComponent.lightMesh.name = 'light_obj'
    SpawnEffectComponent.plateMesh.name = 'plate_obj'
  }, [])

  if (!assetsReady.value) return null

  return <QueryReactor Components={[AvatarRigComponent, GLTFComponent]} ChildEntityReactor={AvatarPendingReactor} />
}

export const AvatarLoadingSystem = defineSystem({
  uuid: 'ee.engine.AvatarLoadingSystem',
  insert: { after: AvatarAnimationSystem },
  execute,
  reactor: () => {
    if (!isClient) return null

    const loadingEffect = useHookstate(getMutableState(AnimationState).avatarLoadingEffect)

    if (!loadingEffect.value) return null

    return <LoadingAssetReactor />
  }
})
