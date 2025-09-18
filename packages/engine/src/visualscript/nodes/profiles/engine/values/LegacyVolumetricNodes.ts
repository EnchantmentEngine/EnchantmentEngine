import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { LegacyVolumetricComponent } from '@ir-engine/engine/src/scene/components/LegacyVolumetricComponent'
import { NodeCategory, makeFlowNodeDefinition } from '@ir-engine/visual-script'

/**
 * playVolumetric: Play / pause volumetric video
 */
export const playVolumetric = makeFlowNodeDefinition({
  typeName: 'engine/media/volumetric/playVolumetric',
  category: NodeCategory.Engine,
  label: 'Play Volumetric',
  in: {
    flow: 'flow',
    entity: 'entity',
    play: 'boolean'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const entity = read<Entity>('entity')
    const play = read<boolean>('play')
    const volumetricComponent = getComponent(entity, LegacyVolumetricComponent)
    volumetricComponent.paused = !play
    setComponent(entity, LegacyVolumetricComponent)
    commit('flow')
  }
})

/**
 * setVolumetricTime: Set volumetric video time
 */
export const setVolumetricTime = makeFlowNodeDefinition({
  typeName: 'engine/media/volumetric/setVolumetricTime',
  category: NodeCategory.Engine,
  label: 'Set Volumetric Time',
  in: {
    flow: 'flow',
    entity: 'entity',
    time: 'float'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const entity = read<Entity>('entity')
    const time = read<number>('time')
    const volumetricComponent = getComponent(entity, LegacyVolumetricComponent)
    volumetricComponent.currentTrackInfo.currentTime = time
    setComponent(entity, LegacyVolumetricComponent)
    commit('flow')
  }
})

/**
 * fadeVolumetricVolume: fade in/out volumetric audio volume
 */
export const fadeVolumetricAudioVolume = makeFlowNodeDefinition({
  typeName: 'engine/media/volumetric/fadeVolumetricVolume',
  category: NodeCategory.Engine,
  label: 'Fade Volumetric Volume',
  in: {
    flow: 'flow',
    entity: 'entity',
    targetVolume: 'float',
    duration: 'float'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit }) => {
    const entity = read<Entity>('entity')
    const targetVolume = read<number>('targetVolume')
    const duration = read<number>('duration')

    LegacyVolumetricComponent.setTransition(entity, 'volume', targetVolume, { duration: duration * 1000 })

    commit('flow')
  }
})
