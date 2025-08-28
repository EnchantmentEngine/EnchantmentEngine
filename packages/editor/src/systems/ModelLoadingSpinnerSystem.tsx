import {
  AnimationSystemGroup,
  ECSState,
  Entity,
  Layers,
  QueryReactor,
  defineSystem,
  getComponent,
  removeEntity,
  useComponent,
  useHasComponent
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { createLoadingSpinner } from '@ir-engine/engine/src/scene/functions/spatialLoadingSpinner'
import { getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { Axis } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import React, { useEffect } from 'react'
import { Quaternion } from 'three'

const spinnerEntities = new Set<Entity>()

const _tmpQuat = new Quaternion()

const LoadingSpinnerReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const gltfComponent = useComponent(props.entity, GLTFComponent)
  const errors = !!ErrorComponent.useComponentErrors(props.entity, GLTFComponent)
  const loaded = GLTFComponent.useSceneLoaded(props.entity)
  const isScene = useHasComponent(entity, SceneComponent)
  const shouldHaveSpinner = !isScene && !!gltfComponent.src && !errors && !loaded

  useEffect(() => {
    if (!shouldHaveSpinner) return
    const spinnerEntity = createLoadingSpinner(`loading ${gltfComponent.src}`, entity)
    spinnerEntities.add(spinnerEntity)
    return () => {
      spinnerEntities.delete(spinnerEntity)
      removeEntity(spinnerEntity)
    }
  }, [shouldHaveSpinner])

  return null
}

export const ModelLoadingSpinnerSystem = defineSystem({
  uuid: 'ee.editor.ModelLoadingSpinnerSystem',
  insert: { with: AnimationSystemGroup },
  execute: () => {
    const delta = getState(ECSState).deltaSeconds
    for (const spinnerEntity of spinnerEntities) {
      const transform = getComponent(spinnerEntity, TransformComponent)
      const angle = delta * Math.PI * 2
      _tmpQuat.setFromAxisAngle(Axis.Z, angle)
      transform.rotation.multiply(_tmpQuat)
    }
  },
  reactor: () => (
    <QueryReactor ChildEntityReactor={LoadingSpinnerReactor} Components={[GLTFComponent]} layer={Layers.Authoring} />
  )
})
