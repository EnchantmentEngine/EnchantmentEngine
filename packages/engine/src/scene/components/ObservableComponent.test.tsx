import { SerializedComponentType } from '@ir-engine/ecs'
import { LoopOnce } from 'three'
import { NodeID } from '../../gltf/NodeIDComponent'
import { ObservableComponent } from './ObservableComponent'

const AnimationTriggerObservableData: SerializedComponentType<typeof ObservableComponent> = {
  observers: [
    // enter
    {
      conditions: [],
      target: '' as NodeID, // loop animation component
      callback: 'EE_loop_animation.deserializeComponent',
      parameters: [{ activeClipIndex: -1, loop: LoopOnce }]
    },
    // exit
    {
      conditions: [],
      target: '' as NodeID, // loop animation component
      callback: 'EE_loop_animation.deserializeComponent',
      parameters: [{ activeClipIndex: -1, loop: LoopOnce }]
    }
  ]
}

const VideoTriggerObservableData: SerializedComponentType<typeof ObservableComponent> = {
  observers: [
    // enter
    {
      conditions: [],
      target: '' as NodeID, // loop animation component
      callback: 'EE_media.deserializeComponent',
      parameters: [{ activeClipIndex: -1, loop: LoopOnce }]
    },
    // exit
    {
      conditions: [],
      target: '' as NodeID, // loop animation component
      callback: 'EE_media.deserializeComponent',
      parameters: [{ activeClipIndex: -1, loop: LoopOnce }]
    }
  ]
}
