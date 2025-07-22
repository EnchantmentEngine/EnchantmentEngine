
import { RenderPass } from 'postprocessing'
import { MeshBasicMaterial, MeshNormalMaterial } from 'three'

import { Entity, getComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'

import { RendererState } from '../RendererState'
import { RendererComponent } from '../components/RendererComponent'
import { RenderModes } from '../constants/RenderModes'

/**
 * Change render mode of the renderer
 * @param mode Mode which will be set to renderer
 */

export function changeRenderMode(entity: Entity) {
  const renderMode = getState(RendererState).renderMode

  const passes = getComponent(entity, RendererComponent).effectComposer?.passes.filter(
    (p) => p.name === 'RenderPass'
  ) as any
  const renderPass: RenderPass = passes ? passes[0] : undefined
  if (!renderPass) return

  switch (renderMode) {
    case RenderModes.UNLIT:
    case RenderModes.LIT:
    case RenderModes.SHADOW:
      renderPass.overrideMaterial = null!
      break
    case RenderModes.WIREFRAME:
      renderPass.overrideMaterial = new MeshBasicMaterial({
        color: 0x000000,
        wireframe: true
      })
      break
    case RenderModes.NORMALS:
      renderPass.overrideMaterial = new MeshNormalMaterial()
      break
  }
}
