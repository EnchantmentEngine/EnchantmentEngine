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

import { ECSState, Entity } from '@ir-engine/ecs'
import { getComponent, getMutableComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Vector3 } from 'three'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { moveAvatar } from '../../avatar/functions/moveAvatar'
import { NPCComponent } from '../components/NPCComponent'
import { NPCMovementComponent } from '../components/NPCMovementComponent'

// WebLLM integration
import * as webllm from '@mlc-ai/web-llm'

// Global WebLLM engine instance
let llmEngine: webllm.MLCEngine | null = null
let isInitializing = false

const npcQuery = defineQuery([NPCComponent, NPCMovementComponent, TransformComponent])

const initializeWebLLM = async (): Promise<webllm.MLCEngine> => {
  if (llmEngine) return llmEngine
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return llmEngine!
  }

  isInitializing = true
  try {
    console.log('Initializing WebLLM for NPC AI...')
    llmEngine = new webllm.MLCEngine()

    // Initialize with a small, fast model suitable for NPC behavior
    await llmEngine.reload('Llama-3.2-1B-Instruct-q4f16_1-MLC')

    console.log('WebLLM initialized successfully')
    return llmEngine
  } catch (error) {
    console.error('Failed to initialize WebLLM:', error)
    throw error
  } finally {
    isInitializing = false
  }
}

const generateAIDecision = async (
  npcName: string,
  currentPosition: Vector3,
  spawnPosition: Vector3,
  behaviorState: string,
  nearbyEntities: string[]
): Promise<{ action: string; targetPosition?: Vector3; newBehaviorState?: string }> => {
  try {
    const engine = await initializeWebLLM()

    const prompt = `You are an AI controlling an NPC named "${npcName}" in a 3D virtual world.

Current status:
- Position: (${currentPosition.x.toFixed(2)}, ${currentPosition.y.toFixed(2)}, ${currentPosition.z.toFixed(2)})
- Spawn point: (${spawnPosition.x.toFixed(2)}, ${spawnPosition.y.toFixed(2)}, ${spawnPosition.z.toFixed(2)})
- Current behavior: ${behaviorState}
- Nearby entities: ${nearbyEntities.join(', ') || 'none'}

Available actions:
- "wander": Move to a random nearby location
- "return_home": Move back towards spawn point
- "idle": Stay in place
- "explore": Move to investigate something interesting

Respond with a JSON object containing:
{
  "action": "wander|return_home|idle|explore",
  "targetPosition": {"x": number, "y": number, "z": number} (if moving),
  "newBehaviorState": "idle|wandering|returning|exploring"
}

Keep movements within 10 units of spawn point. Be concise.`

    const response = await engine.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    // Parse JSON response
    const decision = JSON.parse(content)

    // Convert targetPosition to Vector3 if provided
    if (decision.targetPosition) {
      decision.targetPosition = new Vector3(
        decision.targetPosition.x,
        decision.targetPosition.y,
        decision.targetPosition.z
      )
    }

    return decision
  } catch (error) {
    console.warn('AI decision failed, using fallback:', error)
    // Fallback to simple random behavior
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * 5 + 2
    const targetPosition = new Vector3(
      spawnPosition.x + Math.cos(angle) * distance,
      currentPosition.y,
      spawnPosition.z + Math.sin(angle) * distance
    )

    return {
      action: 'wander',
      targetPosition,
      newBehaviorState: 'wandering'
    }
  }
}

const updateNPCMovement = (entity: Entity, deltaTime: number) => {
  const npcComponent = getComponent(entity, NPCComponent)
  const movementComponent = getComponent(entity, NPCMovementComponent)
  const transform = getComponent(entity, TransformComponent)

  // Check if it's time for a new AI decision
  if (movementComponent.nextDecisionTime <= 0) {
    // Make AI decision
    const nearbyEntities: string[] = [] // TODO: Implement nearby entity detection

    generateAIDecision(
      npcComponent.name,
      transform.position,
      movementComponent.spawnPosition,
      movementComponent.behaviorState,
      nearbyEntities
    )
      .then((decision) => {
        // Apply AI decision - need mutable component to modify
        const mutableMovement = getMutableComponent(entity, NPCMovementComponent)
        if (decision.targetPosition) {
          mutableMovement.targetPosition.value.copy(decision.targetPosition)
          mutableMovement.isMoving.set(true)
        }

        if (decision.newBehaviorState) {
          mutableMovement.behaviorState.set(decision.newBehaviorState)
        }
      })
      .catch(console.error)

    // Reset decision timer - need mutable component to modify
    const mutableMovement = getMutableComponent(entity, NPCMovementComponent)
    mutableMovement.nextDecisionTime.set(movementComponent.decisionInterval)
  } else {
    const mutableMovement = getMutableComponent(entity, NPCMovementComponent)
    mutableMovement.nextDecisionTime.set(movementComponent.nextDecisionTime - deltaTime)
  }

  // Handle movement towards target
  if (movementComponent.isMoving) {
    const currentPos = transform.position
    const targetPos = movementComponent.targetPosition
    const distance = currentPos.distanceTo(targetPos)

    if (distance < 0.5) {
      // Reached target - need mutable component to modify
      const mutableMovement = getMutableComponent(entity, NPCMovementComponent)
      mutableMovement.isMoving.set(false)
      mutableMovement.behaviorState.set('idle')
    } else {
      // Move towards target
      const direction = new Vector3()
        .subVectors(targetPos, currentPos)
        .normalize()
        .multiplyScalar(movementComponent.movementSpeed * deltaTime)

      // Update movement direction - need mutable component to modify
      const mutableMovement = getMutableComponent(entity, NPCMovementComponent)
      mutableMovement.movementDirection.value.copy(direction)

      // Try to find and move the associated avatar
      // This is a simplified approach - in practice you'd need to properly link NPC to avatar entity
      if (hasComponent(entity, AvatarComponent) && hasComponent(entity, AvatarControllerComponent)) {
        moveAvatar(entity, direction)
      }
    }
  }
}

const execute = () => {
  const deltaTime = getState(ECSState).deltaSeconds

  for (const entity of npcQuery()) {
    const npcComponent = getComponent(entity, NPCComponent)
    const movementComponent = getComponent(entity, NPCMovementComponent)
    const transform = getComponent(entity, TransformComponent)

    // Initialize spawn position if not set
    if (movementComponent.spawnPosition.length() === 0) {
      const mutableMovement = getMutableComponent(entity, NPCMovementComponent)
      mutableMovement.spawnPosition.value.copy(transform.position)
    }

    // Initialize AI if not done yet
    if (!npcComponent.aiInitialized) {
      initializeWebLLM()
        .then(() => {
          const mutableNPC = getMutableComponent(entity, NPCComponent)
          mutableNPC.aiInitialized.set(true)
          console.log(`AI initialized for NPC: ${npcComponent.name}`)
        })
        .catch(console.error)
    }

    // Update movement if AI is initialized
    if (npcComponent.aiInitialized) {
      updateNPCMovement(entity, deltaTime)
    }
  }
}

export const NPCSystem = defineSystem({
  uuid: 'ee.engine.NPCSystem',
  insert: { with: SimulationSystemGroup },
  execute
})
