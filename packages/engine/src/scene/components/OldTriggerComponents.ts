import {
  defineComponent,
  Easing,
  getAuthoringCounterpart,
  getComponent,
  getOptionalComponent,
  removeComponent,
  S,
  setComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { useEffect } from 'react'
import { NodeFunctions } from '../../gltf/NodeFunctions'
import { NodeID, NodeIDComponent, NodeIDSchema } from '../../gltf/NodeIDComponent'
import { BehaviorComponent } from './BehaviorComponent'
import { MediaComponent } from './MediaComponent'
import { TriggerCallbackComponent } from './TriggerCallbackComponent'

/**
 * Backwards compatible triggers components
 * - automatically migrates to BehaviorComponent
 * @deprecated
 */
const VideoTriggerComponent = defineComponent({
  name: 'VideoTriggerComponent',
  jsonID: 'EE_video_trigger',

  schema: S.Object({
    mediaEntityUUID: NodeIDSchema(),
    resetEnter: S.Bool(false),
    resetExit: S.Bool(false),
    targetAudioVolume: S.Number(1)
  }),

  reactor: () => {
    const simulationEntity = useEntityContext()
    const entity = getAuthoringCounterpart(simulationEntity) || simulationEntity

    useEffect(() => {
      const component = getComponent(entity, VideoTriggerComponent)

      const mediaEnity = NodeFunctions.getEntityFromNodeID(entity, component.mediaEntityUUID)
      if (!mediaEnity) {
        return removeComponent(entity, VideoTriggerComponent)
      }
      const checkMedia = getOptionalComponent(mediaEnity, MediaComponent)
      if (!checkMedia) {
        return removeComponent(entity, VideoTriggerComponent)
      }

      setComponent(entity, TriggerCallbackComponent, {
        triggers: [
          {
            onEnter: 'onVideoTriggerEnter',
            onExit: 'onVideoTriggerExit',
            target: '' as NodeID
          }
        ]
      })

      setComponent(entity, BehaviorComponent, {
        behaviors: [
          // enter
          {
            conditions: [
              {
                type: 'callback',
                callback: 'onVideoTriggerEnter',
                nodeID: component.mediaEntityUUID
              }
              // {
              //   type: 'entity',
              //   nodeID: component.mediaEntityUUID,
              //   component: MediaComponent.jsonID,
              //   property: 'activeClipIndex',
              //   value: -1,
              //   condition: 'equal'
              // }
            ],
            effects: [
              {
                type: 'setComponent',
                nodeID: getComponent(mediaEnity, NodeIDComponent),
                jsonID: MediaComponent.jsonID,
                values: {
                  volume: 0,
                  paused: false,
                  seekTime: 0
                }
              },
              {
                type: 'transition',
                nodeID: getComponent(mediaEnity, NodeIDComponent),
                jsonID: MediaComponent.jsonID,
                propertyPath: 'volume',
                value: component.targetAudioVolume,
                duration: 1000,
                easing: Easing.exponential.in.path
              }
            ],
            networked: true
          },
          // exit
          {
            conditions: [
              {
                type: 'callback',
                callback: 'onVideoTriggerExit',
                nodeID: component.mediaEntityUUID
              }
            ],
            effects: [
              {
                type: 'transition',
                nodeID: getComponent(mediaEnity, NodeIDComponent),
                jsonID: MediaComponent.jsonID,
                propertyPath: 'volume',
                value: 0,
                duration: 1000,
                easing: Easing.exponential.out.path
              },
              {
                type: 'setComponent',
                nodeID: getComponent(mediaEnity, NodeIDComponent),
                jsonID: MediaComponent.jsonID,
                values: {
                  paused: true,
                  seekTime: 0
                }
              }
            ],
            networked: true
          }
        ]
      })
    }, [])

    return null
  }
})
