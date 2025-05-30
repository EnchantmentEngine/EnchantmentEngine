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

import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

export const NPCMovementComponent = defineComponent({
  name: 'NPCMovementComponent',

  schema: S.Object({
    /** Current target position the NPC is moving towards */
    targetPosition: T.Vec3(),
    /** Current movement speed */
    movementSpeed: S.Number({ default: 1.0 }),
    /** Whether the NPC is currently moving */
    isMoving: S.Bool({ default: false }),
    /** Current behavior state */
    behaviorState: S.String({ default: 'idle' }),
    /** Time until next AI decision */
    nextDecisionTime: S.Number({ default: 0 }),
    /** Decision interval in seconds */
    decisionInterval: S.Number({ default: 3.0 }),
    /** Movement direction vector */
    movementDirection: T.Vec3(),
    /** Whether the NPC should look at target while moving */
    lookAtTarget: S.Bool({ default: true }),
    /** Maximum distance the NPC can wander from spawn point */
    wanderRadius: S.Number({ default: 10.0 }),
    /** Spawn position to return to */
    spawnPosition: T.Vec3()
  })
})
