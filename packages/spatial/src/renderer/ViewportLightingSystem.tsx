import {
  EntityTreeComponent,
  createEntity,
  defineQuery,
  defineSystem,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getState, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { Light } from 'three'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { NameComponent } from '../common/NameComponent'
import { AmbientLightComponent, TransformComponent } from './RendererModule'
import { RendererState } from './RendererState'
import { WebGLRendererSystem } from './WebGLRendererSystem'
import { ObjectComponent } from './components/ObjectComponent'
import { VisibleComponent } from './components/VisibleComponent'
import { LightTagComponent } from './components/lights/LightTagComponent'
import { RenderModes } from './constants/RenderModes'

const lightQuery = defineQuery([LightTagComponent, ObjectComponent])

const execute = () => {
  const renderMode = getState(RendererState).renderMode
  if (renderMode === RenderModes.UNLIT) {
    for (const entity of lightQuery()) {
      const object = getComponent(entity, ObjectComponent) as Light
      object.visible = !object.isLight
    }
  }
}

const reactor = () => {
  const renderer = useMutableState(RendererState)

  useEffect(() => {
    if (renderer.renderMode.value !== RenderModes.UNLIT) return

    const ambientLightEntity = createEntity()
    setComponent(ambientLightEntity, NameComponent, 'Origin Ambient Light')
    setComponent(ambientLightEntity, AmbientLightComponent)
    setComponent(ambientLightEntity, VisibleComponent)
    setComponent(ambientLightEntity, EntityTreeComponent, { parentEntity: getState(ReferenceSpaceState).originEntity })
    setComponent(ambientLightEntity, TransformComponent)
    return () => {
      removeEntity(ambientLightEntity)
    }
  }, [renderer.renderMode])

  return null
}

export const ViewportLightingSystem = defineSystem({
  uuid: 'ee.engine.ViewportLightingSystem',
  insert: { before: WebGLRendererSystem },
  execute,
  reactor
})
