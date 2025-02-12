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

import { useLayoutEffect } from 'react'

import {
  defineSystem,
  EngineState,
  getComponent,
  getOptionalComponent,
  InputSystemGroup,
  UndefinedEntity,
  useEntityContext,
  useExecute
} from '@ir-engine/ecs'
import { defineComponent, removeComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState, useHookstate } from '@ir-engine/hyperflux'

import { getAncestorWithComponents, isAncestor } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import {
  AnyAxis,
  AnyButton,
  AxisMapping,
  AxisValueMap,
  ButtonState,
  ButtonStateMap,
  createInitialButtonState,
  KeyboardButton,
  MouseButton,
  MouseScroll,
  XRStandardGamepadAxes,
  XRStandardGamepadButton
} from '../state/ButtonState'
import { InputState } from '../state/InputState'
import { InputSinkComponent } from './InputSinkComponent'
import { InputSourceComponent } from './InputSourceComponent'

// Types for input bindings
export type ButtonBinding = AnyButton | AnyButton[]
export type AxisBinding = AnyAxis
export type InputButtonBindings = Record<string, ButtonBinding[]>
export type InputAxisBindings = Record<string, AxisBinding[]>

export const DefaultButtonBindings = {
  Interact: [MouseButton.PrimaryClick, XRStandardGamepadButton.XRStandardGamepadTrigger, KeyboardButton.KeyE],
  FollowCameraModeCycle: [KeyboardButton.KeyV],
  FollowCameraFirstPerson: [KeyboardButton.KeyF],
  FollowCameraShoulderCam: [KeyboardButton.KeyC]
} satisfies InputButtonBindings

export const DefaultAxisBindings = {
  FollowCameraZoomScroll: [
    MouseScroll.VerticalScroll,
    XRStandardGamepadAxes.XRStandardGamepadThumbstickY,
    XRStandardGamepadAxes.XRStandardGamepadTouchpadY
  ],
  FollowCameraShoulderCamScroll: [MouseScroll.HorizontalScroll]
} satisfies InputAxisBindings

// Add these type definitions before the InputComponent definition
export type ButtonStateProxy = {
  cachedResults: ButtonStateMap<any>
} & ButtonStateMap<any>

export const InputComponent = defineComponent({
  name: 'InputComponent',
  jsonID: 'EE_input',

  schema: S.Object({
    inputSinks: S.Array(S.EntityUUID(), ['Self']),
    activationDistance: S.Number(2),
    highlight: S.Bool(false),
    grow: S.Bool(false),

    //internal
    /** populated automatically by ClientInputSystem */
    inputSources: S.NonSerialized(S.Array(S.Entity()))
  }),

  useExecuteWithInput(
    executeOnInput: () => void,
    executeWhenEditing = false,
    order: InputExecutionOrder = InputExecutionOrder.With
  ) {
    const entity = useEntityContext()

    return useExecute(() => {
      const isEditing = getState(EngineState).isEditing
      const capturingEntity = getState(InputState).capturingEntity

      // Don't execute if:
      // 1. We don't want to execute when editing and we are editing
      // 2. The entity is not an ancestor of the capturing entity
      if ((!executeWhenEditing && isEditing) || !isAncestor(capturingEntity, entity, true)) {
        return
      }

      executeOnInput()
    }, getInputExecutionInsert(order))
  },

  getInputEntities(entityContext: Entity): Entity[] {
    const inputSinkEntity = getAncestorWithComponents(entityContext, [InputSinkComponent], true, true)
    const closestInputEntity = getAncestorWithComponents(entityContext, [InputComponent], true, true)
    const inputSinkInputEntities = getOptionalComponent(inputSinkEntity, InputSinkComponent)?.inputEntities ?? []
    const inputEntities = [closestInputEntity, ...inputSinkInputEntities]
    return Array.from(new Set(inputEntities.filter((entity) => entity !== UndefinedEntity))) // remove duplicates
  },

  getInputSourceEntities(entityContext: Entity) {
    const inputEntities = InputComponent.getInputEntities(entityContext)
    return Array.from(
      new Set(
        inputEntities.reduce<Entity[]>((prev, eid) => {
          return [...prev, ...getComponent(eid, InputComponent).inputSources]
        }, [])
      )
    )
  },

  getMergedButtons<BindingsType extends InputButtonBindings = typeof DefaultButtonBindings>(
    entityContext: Entity,
    inputBindings: BindingsType = DefaultButtonBindings as unknown as BindingsType
  ) {
    const entityButtonStates = getState(InputState).entityButtonStates
    if (!entityButtonStates.has(entityContext)) {
      const buttonStates = {} as ButtonStateProxy
      const cachedResults = (buttonStates.cachedResults = {} as ButtonStateMap<any>)

      const proxy = new Proxy(buttonStates, {
        get: (target: ButtonStateProxy, prop: string) => {
          if (prop === 'cachedResults') {
            return target[prop]
          }
          if (typeof prop === 'symbol') {
            return target[prop]
          }

          // Check cache first
          if (Object.hasOwn(cachedResults, prop)) {
            if (!cachedResults[prop]) return undefined
            if (cachedResults[prop] && cachedResults[prop].consumed) return cachedResults[prop]
          }

          let result = cachedResults[prop]

          // Get all input source entities
          const inputSourceEntities = InputComponent.getInputSourceEntities(entityContext)
          console.log('Checking button:', prop)
          console.log('Input source entities:', inputSourceEntities)

          // Helper function to find first unconsumed button state
          const findButtonState = (button: AnyButton): ButtonState | undefined => {
            console.log('Looking for button:', button)
            for (const sourceEntity of inputSourceEntities) {
              const inputSourceComponent = getOptionalComponent(sourceEntity, InputSourceComponent)
              if (!inputSourceComponent) continue
              const state = inputSourceComponent.buttons[button]
              console.log('Found state:', state)
              if (state && !state.consumed) {
                return state
              }
            }
            return undefined
          }

          // First check mapped button states since they define the mapping from alias to actual buttons
          if (inputBindings && prop in inputBindings) {
            console.log('Found in bindings:', inputBindings[prop])
            const bindings = inputBindings[prop]
            for (const binding of bindings) {
              if (Array.isArray(binding)) {
                // For combo buttons, check if all buttons in the combo are available
                const states = binding.map(findButtonState).filter((s): s is ButtonState => s !== undefined)
                console.log('Combo states:', states)

                const isActive = states.length === binding.length

                if (!result && isActive) {
                  // All buttons in combo are active and not consumed, consume them and set the result
                  states.forEach((s) => (s.consumed = true))
                  result = cachedResults[prop] = createInitialButtonState(states[0].inputSourceEntity)
                }

                if (result && isActive) {
                  result.down = states.every((s) => s.down)
                  result.pressed = states.every((s) => s.pressed)
                  result.touched = states.every((s) => s.touched)
                  result.value = Math.max(...states.map((s) => s.value))
                  result.dragging = states.some((s) => s.dragging)
                  result.rotating = states.some((s) => s.rotating)
                  result.up = false
                  result.consumed = true
                  return result
                } else if (result) {
                  result.up = true
                  result.consumed = true
                }
              } else {
                // For single button bindings, just return that button
                result = cachedResults[prop] = findButtonState(binding)
                console.log('Single button state:', result)
                if (result) result.consumed = true
                return result
              }

              // If we get here, the button in the binding is not available, so set the state to undefined
              return (cachedResults[prop] = undefined)
            }
          }

          // Otherwise check if this exact button exists and is not consumed
          const rawState = findButtonState(prop as AnyButton)
          console.log('Raw state:', rawState)
          cachedResults[prop] = rawState
          if (rawState) rawState.consumed = true
          return rawState
        }
      })

      entityButtonStates.set(entityContext, proxy)
    }

    return entityButtonStates.get(entityContext)!
  },

  getMergedAxes<BindingsType extends InputAxisBindings = typeof DefaultAxisBindings>(
    entityContext: Entity,
    inputBindings: BindingsType = DefaultAxisBindings as unknown as BindingsType
  ) {
    const inputSourceEntities = InputComponent.getInputSourceEntities(entityContext)

    const axes = {
      0: 0,
      1: 0,
      2: 0,
      3: 0
    } as any

    for (const eid of inputSourceEntities) {
      const inputSource = getComponent(eid, InputSourceComponent)
      if (inputSource.source.gamepad?.axes) {
        const mapping = AxisMapping[inputSource.source.gamepad.mapping]
        for (let i = 0; i < 4; i++) {
          const newAxis = inputSource.source.gamepad.axes[i] ?? 0
          axes[i] = getLargestMagnitudeNumber(axes[i] ?? 0, newAxis)
          axes[mapping[i]] = axes[i]
        }
      }
    }

    for (const key of Object.keys(inputBindings)) {
      const bindings = inputBindings[key]
      axes[key] = bindings.reduce<number>((prev, binding) => {
        return getLargestMagnitudeNumber(prev, axes[binding] ?? 0)
      }, 0)
    }

    return axes as AxisValueMap<BindingsType>
  },

  useHasFocus() {
    const entity = useEntityContext()
    const hasFocus = useHookstate(() => {
      return InputComponent.getInputSourceEntities(entity).length > 0
    })
    useExecute(
      () => {
        const inputSources = InputComponent.getInputSourceEntities(entity)
        hasFocus.set(inputSources.length > 0)
      },
      // we want to evaluate input sources after the input system group has run, after all input systems
      // have had a chance to respond to input and/or capture input sources
      { after: InputSystemGroup }
    )
    return hasFocus
  },

  reactor: () => {
    const entity = useEntityContext()
    const input = useComponent(entity, InputComponent)

    useLayoutEffect(() => {
      if (!input.inputSources.length || !input.highlight.value) return
      setComponent(entity, HighlightComponent)
      return () => {
        removeComponent(entity, HighlightComponent)
      }
    }, [input.inputSources, input.highlight])

    // useEffect(() => {
    //   // perhaps we don't need to create a rigidbody; we just want to be able to add anything in this tree to the `input` layer,
    //   // whether or not it's a rigidbody or a mesh
    //
    //   //then we might just need to abandon the Input layer raycast, leave that as-is, add the distance heuristic and call it a day
    //
    //   // the input system can still perform physics and mesh bvh raycasts on things that have an InputComponent as an entity ancestor
    //   // I think I know how this can work
    //   //awesome
    //
    //   //techincally if we add the distance heuristic a rigidbody / collider are not needed
    //
    //   // after entity tree has loaded (how do we check for this...)
    //   // create an input rigidbody if one doesn't exist
    //   // if (!hasComponent(entity, RigidBodyComponent)) {
    //   //   setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed }) //assume kinematic if it had no rigidbody before
    //   // }
    //   // // create an input colliderComponent if one doesn't exist
    //   // if (!hasComponent(entity, ColliderComponent)) {
    //   //   //TODO - check if we have a mesh, if we do, use the mesh as a collider type....if not then generate a bounding sphere
    //   //   setComponent(entity, ColliderComponent)
    //   // }
    //   // const hasMesh = hasComponent(entity, MeshComponent)
    //   // const collider = getMutableComponent(entity, ColliderComponent)
    //   // collider.collisionLayer.set(collider.collisionLayer.value | CollisionGroups.Input)
    // }, [])

    /** @todo - fix */
    // useLayoutEffect(() => {
    //   if (!input.inputSources.length || !input.grow.value) return
    //   setComponent(entity, AnimateScaleComponent)
    //   return () => {
    //     removeComponent(entity, AnimateScaleComponent)
    //   }
    // }, [input.inputSources, input.grow])

    return null
  }
})

function getLargestMagnitudeNumber(a: number, b: number) {
  return Math.abs(a) > Math.abs(b) ? a : b
}

export const enum InputExecutionOrder {
  'Before' = -1,
  'With' = 0,
  'After' = 1
}

function getInputExecutionInsert(order: InputExecutionOrder) {
  switch (order) {
    case InputExecutionOrder.Before:
      return { before: InputExecutionSystemGroup }
    case InputExecutionOrder.After:
      return { after: InputExecutionSystemGroup }
    default:
      return { with: InputExecutionSystemGroup }
  }
}

/** System for inserting subsystems*/
export const InputExecutionSystemGroup = defineSystem({
  uuid: 'ee.engine.InputExecutionSystemGroup',
  insert: { with: InputSystemGroup }
})
