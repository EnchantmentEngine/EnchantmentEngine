/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

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
