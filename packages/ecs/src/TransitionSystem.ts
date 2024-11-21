import { defineAction, defineState, getMutableState, matches } from '@ir-engine/hyperflux'
import { EasingFunctionPaths } from './Easing'
import { EntityUUID, matchesEntityUUID } from './Entity'
import { defineSystem } from './SystemFunctions'
import { AnimationSystemGroup } from './SystemGroups'

type ComponentUUID = string
type PropertyPath = string

export type TimestampedValue<V> = {
  timestamp: number
  value: V
}

export const InterpolationFunction = {
  number: (a: number, b: number, t: number, out?: number) => a + (b - a) * t,
  vector2: (a: [number, number], b: [number, number], t: number, out?: [number, number]) => {
    out = out || [0, 0]
    out[0] = a[0] + (b[0] - a[0]) * t
    out[1] = a[1] + (b[1] - a[1]) * t
    return out
  }
} satisfies Record<string, (a: any, b: any, t: number, out?: any) => any>

export interface TransitionData<T> {
  entityUUID: EntityUUID
  componentUUID: ComponentUUID
  propertyPath: PropertyPath
  propertyType: string
  buffer: TimestampedValue<T>[]
  maxBufferSize: number
  duration: number

  easingFunction: (t: number) => number
  interpolationFunction: (a: T, b: T, t: number, out?: T) => T
}

export class TransitionActions {
  static setTransition = defineAction({
    type: 'ir.ecs.SET_TRANSITION' as const,
    entityUUID: matchesEntityUUID,
    easing: matches.some(...EasingFunctionPaths.map((e) => matches.literal(e))).optional,
    duration: matches.number.optional,
    property: matches.string,
    target: matches.any
  })

  static removeTransition = defineAction({
    type: 'ir.ecs.REMOVE_TRANSITION' as const
  })
}

export const TransitionState = defineState({
  name: 'TransitionState',
  initial: () => ({}) as Record<EntityUUID, Record<PropertyPath, TransitionData<any>[]>>,
  receptors: {
    setTransition: TransitionActions.setTransition.receive((action) => {
      const transition = getMutableState(TransitionState)
      // transition[action.entityUUID].merge({
      //   [action.property]: {
      //     buffer: [{ timestamp: 0, value: action.target }],
      //     current: action.target,
      //     maxBufferSize: 10,
      //     duration: action.duration || 500,
      //     easingFunction: action.easing || EasingFunctionPaths[0],
      //     interpolationFunction: (a: any, b: any, t: number, out?: any) => a + (b - a) * t
      //   }
      // })
    }),
    removeTransition: TransitionActions.removeTransition.receive((action) => {
      const transition = getMutableState(TransitionState)
      // transition[action.entityUUID].set
    })
  }
})

export const TransitionSystem = defineSystem({
  uuid: 'TransitionSystem',
  execute: () => {},
  insert: {
    before: AnimationSystemGroup
  }
})
