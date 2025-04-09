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

import { useEffect } from 'react'

import { EntityUUID, setComponent, UUIDComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineAction, getMutableState, matches, useHookstate } from '@ir-engine/hyperflux'
import { NetworkTopics } from '@ir-engine/network'

import { defineNetworkedComponent } from '../defineNetworkedComponent'

// Define additional actions for item operations
const itemActions = {
  updateQuantity: defineAction({
    type: 'ee.networked.ItemComponent.UPDATE_QUANTITY',
    entityUUID: matches.string,
    quantity: matches.number,
    $topic: NetworkTopics.world
  }),

  transferOwnership: defineAction({
    type: 'ee.networked.ItemComponent.TRANSFER_OWNERSHIP',
    entityUUID: matches.string,
    newOwner: matches.string,
    $topic: NetworkTopics.world
  })
}

/**
 * Example of using defineNetworkedComponent to create an item component
 * with event sourcing for network synchronization
 */
export const {
  component: ItemComponent,
  state: ItemState,
  actions: ItemActions,
  spawnEntity: spawnItem
} = defineNetworkedComponent({
  component: {
    name: 'ItemComponent',
    jsonID: 'EE_item',

    schema: S.Object({
      itemId: S.String(''),
      name: S.String(''),
      description: S.String(''),
      modelUrl: S.String(''),
      quantity: S.Number(1),
      maxStackSize: S.Number(1),
      owner: S.String('')
    })
    // No need for component reactor - handled by state reactor
  },

  // Additional actions for item-specific operations
  actions: {
    ...itemActions
    // The spawn action is automatically created by defineNetworkedComponent
  },

  // Custom reactor for item-specific state updates
  stateReactor: ({ entityUUID }: { entityUUID: EntityUUID }) => {
    const entity = UUIDComponent.useEntityByUUID(entityUUID)
    const itemState = useHookstate(getMutableState(ItemState)[entityUUID])

    // Apply state changes to component
    useEffect(() => {
      if (!entity || !itemState.value) return

      setComponent(entity, ItemComponent, {
        ...itemState.value
      })
    }, [entity, itemState.value])

    return null
  }
})

/**
 * In a real application, you would define all receptors in the initial state definition
 * by creating a complete state definition before passing it to defineNetworkedComponent.
 *
 * Here's how you would do it:
 */

// 1. Define your actions
// const itemActions = { ... } (as above)

// 2. Create a complete state definition with all receptors
// const ItemStateDefinition = {
//   name: 'ee.networked.ItemComponent.State',
//   initial: {} as Record<EntityUUID, {
//     itemId: string,
//     name: string,
//     description: string,
//     modelUrl: string,
//     quantity: number,
//     maxStackSize: number,
//     owner: string
//   }>,
//   receptors: {
//     // Basic receptors will be added by defineNetworkedComponent
//     // Add your custom receptors here:
//     onUpdateQuantity: itemActions.updateQuantity.receive((action) => {
//       getMutableState(ItemState)[action.entityUUID].quantity.set(action.quantity)
//     }),
//     onTransferOwnership: itemActions.transferOwnership.receive((action) => {
//       getMutableState(ItemState)[action.entityUUID].owner.set(action.newOwner)
//     })
//   }
// }

// 3. Pass the state definition to defineNetworkedComponent
// export const {
//   component: ItemComponent,
//   state: ItemState,
//   actions: ItemActions,
//   spawnEntity: spawnItem
// } = defineNetworkedComponent({
//   component: { ... },
//   actions: itemActions,
//   stateDefinition: ItemStateDefinition, // This would be a new parameter
//   stateReactor: ({ entityUUID }) => { ... }
// })

// For this example, we'll handle the actions directly in our code
// This is an alternative to adding receptors to the state

// Example of how to handle the updateQuantity action:
itemActions.updateQuantity.receive((action) => {
  getMutableState(ItemState)[action.entityUUID].quantity.set(action.quantity)
})

// Example of how to handle the transferOwnership action:
itemActions.transferOwnership.receive((action) => {
  getMutableState(ItemState)[action.entityUUID].owner.set(action.newOwner)
})

/**
 * Example usage:
 *
 * // Import the necessary functions
 * import { dispatchAction } from '@ir-engine/hyperflux'
 *
 * // Spawn a new item
 * const { entity, entityUUID } = spawnItem({
 *   parentUUID: '0', // Root entity
 *   position: { x: 0, y: 1, z: 0 },
 *   itemId: 'sword-123',
 *   name: 'Excalibur',
 *   description: 'A legendary sword',
 *   modelUrl: 'https://example.com/sword.glb',
 *   quantity: 1,
 *   maxStackSize: 1,
 *   owner: 'player-123'
 * })
 *
 * // Update item quantity
 * dispatchAction(itemActions.updateQuantity({
 *   entityUUID,
 *   quantity: 2
 * }))
 *
 * // Transfer ownership
 * dispatchAction(itemActions.transferOwnership({
 *   entityUUID,
 *   newOwner: 'player-456'
 * }))
 */
