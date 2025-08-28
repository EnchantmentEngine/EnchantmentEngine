import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getState } from '@ir-engine/hyperflux'
import { ParticleState } from '../types/ParticleSystemTypes'
import { SceneObjectSystem } from './SceneObjectSystem'

const execute = () => {
  const renderers = getState(ParticleState).renderers
  for (const rendererInstance of Object.values(renderers)) {
    const batchRenderer = rendererInstance.renderer
    const deltaSeconds = getState(ECSState).deltaSeconds
    batchRenderer.update(deltaSeconds)
  }
}

export const ParticleSystem = defineSystem({
  uuid: 'ee.engine.ParticleSystem',
  insert: { with: SceneObjectSystem },
  execute
})
