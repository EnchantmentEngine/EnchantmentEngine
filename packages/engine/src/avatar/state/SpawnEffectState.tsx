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

import { getComponent, removeEntity, UUIDComponent } from '@ir-engine/ecs'
import { TransitionActions } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineState } from '@ir-engine/hyperflux'
import { SpawnEffectComponent } from '../components/SpawnEffectComponent'

// Define a state just for the receptor - no need to store any data here
export const SpawnEffectState = defineState({
  name: 'ee.engine.avatar.SpawnEffectState',

  // Empty initial state since we're not storing anything
  initial: {},

  receptors: {
    onTransitionComplete: TransitionActions.transitionComplete.receive((action) => {
      // Check if this is a transition for a SpawnEffectComponent's opacityMultiplier property
      if (action.componentJsonID === SpawnEffectComponent.jsonID && action.propertyPath === 'opacityMultiplier') {
        // Get the entity from the UUID
        const entity = UUIDComponent.getEntityByUUID(action.entityUUID)
        if (!entity) return

        // Check if the entity has the SpawnEffectComponent
        if (getComponent(entity, SpawnEffectComponent)) {
          const component = getComponent(entity, SpawnEffectComponent)

          // If the component is marked as fading out, remove the entity
          if (component.isFadingOut) {
            removeEntity(entity)
          }
        }
      }
    })
  }
})
