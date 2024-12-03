import { Color, Quaternion, Vector2, Vector3 } from 'three'

export const Transitionable = {
  number: {
    interpolate: (a: number, b: number, t: number) => a + (b - a) * t,
    isType: (a: any): a is number => typeof a === 'number'
  },
  vector2: {
    interpolate: (a: Vector2, b: Vector2, t: number, out?: Vector2) => {
      out = out || new Vector2()
      out.x = a.x + (b.x - a.x) * t
      out.y = a.y + (b.y - a.y) * t
      return out
    },
    isType: (a: any): a is Vector2 => a instanceof Vector2
  },
  vector3: {
    interpolate: (a: Vector3, b: Vector3, t: number, out?: Vector3) => {
      out = out || new Vector3()
      out.x = a.x + (b.x - a.x) * t
      out.y = a.y + (b.y - a.y) * t
      out.z = a.z + (b.z - a.z) * t
      return out
    },
    isType: (a: any): a is Vector3 => a instanceof Vector3
  },
  quaternion: {
    interpolate: (a: Quaternion, b: Quaternion, t: number, out?: Quaternion) => {
      out = out || a.clone()
      return out.slerp(b, t)
    },
    isType: (a: any): a is Quaternion => a instanceof Quaternion
  },
  color: {
    interpolate: (a: Color, b: Color, t: number, out?: Color) => {
      out = out || new Color()
      out.lerpColors(a, b, t)
      return out
    },
    isType: (a: any): a is Color => a instanceof Color
  },
  colorHSL: {
    interpolate: (a: Color, b: Color, t: number, out?: Color) => {
      out = out || new Color()
      out.copy(a).lerpHSL(b, t)
      return out
    },
    isType: (a: any): a is Color => a instanceof Color
  }
} satisfies Record<string, Transitionable>

export type Transitionable = {
  interpolate(a: any, b: any, t: number, out?: any): any
  isType(a: any): boolean
}

// get all of the Transitionable types supported
export type TransitionableTypes = {
  [K in keyof typeof Transitionable]: (typeof Transitionable)[K] extends Transitionable
    ? (typeof Transitionable)[K] extends { isType: (a: any) => a is infer T }
      ? T
      : never
    : never
}[keyof typeof Transitionable]

export function getTransitionableKeyForType(type: TransitionableTypes) {
  return Object.entries(Transitionable).find(([key, value]) => value.isType(type))?.[0] as
    | keyof typeof Transitionable
    | undefined
}
