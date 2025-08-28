import { useEntityContext } from '@ir-engine/ecs'
import { getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { QueryReactor, defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getState } from '@ir-engine/hyperflux'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ResourceAssetType, ResourceState } from '@ir-engine/spatial/src/resources/ResourceState'
import { TweenComponent } from '@ir-engine/spatial/src/transform/components/TweenComponent'
import { TransformDirtyUpdateSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import React from 'react'
import { AnimationComponent } from '../components/AnimationComponent'

const tweenQuery = defineQuery([TweenComponent])
const animationQuery = defineQuery([AnimationComponent, VisibleComponent])

const execute = () => {
  const { deltaSeconds } = getState(ECSState)

  for (const entity of tweenQuery()) {
    const tween = getComponent(entity, TweenComponent)
    tween.update()
  }

  for (const entity of animationQuery()) {
    const animationComponent = getComponent(entity, AnimationComponent)
    const modifiedDelta = deltaSeconds
    animationComponent.mixer.update(modifiedDelta)
    //const animationActionComponent = getOptionalMutableComponent(entity, LoopAnimationComponent)
    // animationActionComponent?._action.value &&
    //   animationActionComponent?.time.set(animationActionComponent._action.value.time)
  }
}

export const AnimationSystem = defineSystem({
  uuid: 'ee.engine.AnimationSystem',
  insert: { before: TransformDirtyUpdateSystem },
  execute,

  /**
   * Kind of a hack to to track animations in the resource manager, because they arent reactively set on the ObjectComponent
   */
  reactor: () => {
    return (
      <>
        <QueryReactor Components={[AnimationComponent]} ChildEntityReactor={AnimationReactor} />
      </>
    )
  }
})

const AnimationReactor = () => {
  const entity = useEntityContext()
  ResourceState.useEntityResource(
    entity,
    useComponent(entity, AnimationComponent).animations as any as ResourceAssetType
  )
  return null
}
