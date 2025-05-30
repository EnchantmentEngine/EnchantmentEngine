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

/**
 * Example usage of NPCComponent
 *
 * This file demonstrates how to create and use NPCs with AI-driven movement
 * in your IR Engine scenes.
 */

import { Entity, createEntity, setComponent } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Quaternion, Vector3 } from 'three'

import { NPCComponent } from './NPCComponent'
import { NPCMovementComponent } from './NPCMovementComponent'

/**
 * Create a basic NPC with default settings
 */
export function createBasicNPC() {
  const npcEntity = createEntity()

  // Set initial position and transform
  setComponent(npcEntity, TransformComponent, {
    position: new Vector3(0, 0, 0),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })

  // Add NPC component with basic settings
  setComponent(npcEntity, NPCComponent, {
    name: 'BasicNPC',
    avatarURL: '/packages/projects/default-project/assets/avatars/irRobot.vrm'
  })

  return npcEntity
}

/**
 * Create an NPC with custom movement settings
 */
export function createCustomNPC(name: string, avatarURL: string, position: Vector3) {
  const npcEntity = createEntity()

  // Set initial position and transform
  setComponent(npcEntity, TransformComponent, {
    position: position.clone(),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })

  // Add NPC component
  setComponent(npcEntity, NPCComponent, {
    name,
    avatarURL
  })

  // Customize movement behavior
  setComponent(npcEntity, NPCMovementComponent, {
    movementSpeed: 2.0,
    wanderRadius: 15.0,
    decisionInterval: 2.0,
    spawnPosition: position.clone()
  })

  return npcEntity
}

/**
 * Create multiple NPCs in a scene
 */
export function createNPCGroup() {
  const npcs: Entity[] = []

  // Create a guard NPC
  const guard = createCustomNPC(
    'Guard',
    '/packages/projects/default-project/assets/avatars/irRobot.vrm',
    new Vector3(-5, 0, 0)
  )
  npcs.push(guard)

  // Create a wandering NPC
  const wanderer = createCustomNPC(
    'Wanderer',
    '/packages/projects/default-project/assets/avatars/irRobot.vrm',
    new Vector3(5, 0, 5)
  )
  npcs.push(wanderer)

  // Create a shopkeeper NPC
  const shopkeeper = createCustomNPC(
    'Shopkeeper',
    '/packages/projects/default-project/assets/avatars/irRobot.vrm',
    new Vector3(0, 0, 10)
  )
  // Shopkeeper moves slowly and stays close to spawn
  setComponent(shopkeeper, NPCMovementComponent, {
    movementSpeed: 0.5,
    wanderRadius: 3.0,
    decisionInterval: 5.0
  })
  npcs.push(shopkeeper)

  return npcs
}

/**
 * Example of how to integrate NPCs into a scene loading function
 */
export function addNPCsToScene() {
  console.log('Adding NPCs to scene...')

  // Create basic NPCs
  const basicNPC = createBasicNPC()
  console.log('Created basic NPC:', basicNPC)

  // Create a group of NPCs
  const npcGroup = createNPCGroup()
  console.log('Created NPC group:', npcGroup)

  return {
    basicNPC,
    npcGroup
  }
}

/**
 * Usage in a scene file:
 *
 * ```typescript
 * import { addNPCsToScene } from './NPCComponent.example'
 *
 * // In your scene setup function:
 * export function setupMyScene() {
 *   // ... other scene setup
 *
 *   // Add NPCs
 *   const npcs = addNPCsToScene()
 *
 *   // ... rest of scene setup
 * }
 * ```
 */
