import {
  Entity,
  Layers,
  PresentationSystemGroup,
  QueryReactor,
  defineSystem,
  removeEntity,
  useComponent,
  useHasComponent
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { createLoadingSpinner } from '@ir-engine/engine/src/scene/functions/spatialLoadingSpinner'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import React, { useEffect } from 'react'

const LoadingSpinnerReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const gltfComponent = useComponent(props.entity, GLTFComponent)
  const errors = !!ErrorComponent.useComponentErrors(props.entity, GLTFComponent)?.value
  const loaded = GLTFComponent.useSceneLoaded(props.entity)
  const isScene = useHasComponent(entity, SceneComponent)
  const shouldHaveSpinner = !isScene && !!gltfComponent.src.value && !errors && !loaded

  useEffect(() => {
    if (!shouldHaveSpinner) return
    const spinnerEntity = createLoadingSpinner(`loading ${gltfComponent.src.value}`, entity)
    return () => {
      removeEntity(spinnerEntity)
    }
  }, [shouldHaveSpinner])

  return null
}

export const ModelLoadingSpinnerSystem = defineSystem({
  uuid: 'ee.editor.ModelLoadingSpinnerSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => (
    <QueryReactor ChildEntityReactor={LoadingSpinnerReactor} Components={[GLTFComponent]} layer={Layers.Authoring} />
  )
})
