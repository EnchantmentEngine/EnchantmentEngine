
import { defineQuery, defineSystem, Engine, Entity, getChildrenWithComponents } from '@ir-engine/ecs'
import { defineComponent, getComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { OutlineEffect } from 'postprocessing'
import { WebGLRendererSystem } from '../WebGLRendererSystem'
import { MeshComponent } from './MeshComponent'
import { RendererComponent } from './RendererComponent'
import { VisibleComponent } from './VisibleComponent'

export const HighlightComponent = defineComponent({ name: 'HighlightComponent' })

const highlightQuery = defineQuery([HighlightComponent])

const getCompObject = (entity: Entity) => getComponent(entity, MeshComponent)

const execute = () => {
  /** @todo support multiple render contexts */
  if (!hasComponent(Engine.instance.viewerEntity, RendererComponent)) return

  const rendererComponent = getComponent(Engine.instance.viewerEntity, RendererComponent)
  const outlineEffect = rendererComponent?.effectInstances?.OutlineEffect as OutlineEffect
  outlineEffect?.selection.set(
    highlightQuery()
      .flatMap((e) => getChildrenWithComponents(e, [MeshComponent, VisibleComponent]))
      .map(getCompObject)
  )
}

export const HighlightSystem = defineSystem({
  uuid: 'ir.spatial.render.HighlightSystem',
  insert: { before: WebGLRendererSystem },
  execute
})
