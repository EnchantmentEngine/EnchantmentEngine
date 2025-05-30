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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Entity } from '@ir-engine/ecs'
import { defineComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { dispatchAction, PeerID } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import { UUIDComponent } from '@ir-engine/ecs'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { NPCMovementComponent } from './NPCMovementComponent'

export const NPCComponent = defineComponent({
  name: 'NPCComponent',
  jsonID: 'EE_npc',

  schema: S.Object({
    /** The display name of the NPC */
    name: S.String({ default: 'NPC' }),
    /** The URL to the avatar model (VRM file) */
    avatarURL: S.String({ default: '' }),
    /** Whether the NPC AI brain is initialized */
    aiInitialized: S.Bool({ default: false, serialized: false }),
    /** Current AI state/behavior */
    aiState: S.String({ default: 'idle', serialized: false })
  }),

  reactor: function (props: { entity: Entity }) {
    const entity = props.entity
    const npcComponent = useComponent(entity, NPCComponent)

    useEffect(() => {
      // Set the name component
      setComponent(entity, NameComponent, npcComponent.name.value)
    }, [npcComponent.name])

    useEffect(() => {
      // Initialize movement component
      setComponent(entity, NPCMovementComponent)
    }, [])

    useEffect(() => {
      // Load avatar when avatarURL is set
      if (npcComponent.avatarURL.value && npcComponent.avatarURL.value.length > 0) {
        const transform = useComponent(entity, TransformComponent)

        // Spawn avatar using existing avatar system
        dispatchAction(
          AvatarNetworkAction.spawn({
            $peer: `npc-${entity}` as PeerID,
            parentUUID: UUIDComponent.get(entity),
            position: transform.position.value || new Vector3(),
            rotation: transform.rotation.value || new Quaternion(),
            entityID: `npc-avatar-${entity}` as any,
            entitySourceID: `npc-source-${entity}` as any,
            avatarURL: npcComponent.avatarURL.value,
            name: npcComponent.name.value
          })
        )
      }
    }, [npcComponent.avatarURL])

    return null
  }
})
