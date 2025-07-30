import { Tween } from '@tweenjs/tween.js'

import { createEntity, removeEntity } from '@ir-engine/ecs'
import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { VolumetricComponent } from '@ir-engine/engine/src/scene/components/VolumetricComponent'
import { TweenComponent } from '@ir-engine/spatial/src/transform/components/TweenComponent'
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
    const volumetricComponent = getComponent(entity, VolumetricComponent)
    volumetricComponent.paused = !play
    setComponent(entity, VolumetricComponent)
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
    const volumetricComponent = getComponent(entity, VolumetricComponent)
    volumetricComponent.time.currentTime = time
    setComponent(entity, VolumetricComponent)
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

    const volumetricComponent = getComponent(entity, VolumetricComponent)
    const volumeSlider: any = {}

    Object.defineProperty(volumeSlider, 'volume', {
      get: () => volumetricComponent.volume,
      set: (value) => {
        setComponent(entity, VolumetricComponent, { volume: value })
      }
    })
    const tweenEntity = createEntity()
    setComponent(
      tweenEntity,
      TweenComponent,
      new Tween<any>(volumeSlider)
        .to({ volume: targetVolume }, duration * 1000)
        .start()
        .onComplete(() => {
          removeEntity(tweenEntity)
        })
    )
    commit('flow')
  }
})
