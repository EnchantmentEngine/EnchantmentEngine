import { Box3, Color, ColorRepresentation, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from 'three'

import { Options, TProperties } from '@ir-engine/ecs/src/schemas/JSONSchemaTypes'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

const isColorObj = (color?: ColorRepresentation): color is Color => {
  return color !== undefined && (color as Color).r !== undefined
}

export const NonEmptyString = (errMsg: string) => {
  return (str: string): boolean => {
    if (!str) {
      console.error(errMsg)
      return false
    }

    return true
  }
}

export const NonEmptyArray = (errMsg: string) => {
  return (arr: unknown[]): boolean => {
    if (!arr || arr.length === 0) {
      console.error(errMsg)
      return false
    }

    return true
  }
}

type Init<T> = T

export const T = {
  /** Vector2 type schema helper, defaults to { x: 0, y: 0 } */
  Vec2: (init = { x: 0, y: 0 } as Init<Vector2>, options?: Options<Vector2>) =>
    S.SerializedClass(
      {
        x: S.Number(),
        y: S.Number()
      },
      {
        deserialize: (curr, value) => curr.copy(value),
        default: () => new Vector2(init.x, init.y),
        ...options,
        id: 'Vec2'
      }
    ),

  /** Vector3 type schema helper, defaults to { x: 0, y: 0, z: 0 } */
  Vec3: (init = { x: 0, y: 0, z: 0 } as Init<Vector3>, options?: Options<Vector3>) =>
    S.SerializedClass(
      {
        x: S.Number(),
        y: S.Number(),
        z: S.Number()
      },
      {
        deserialize: (curr, value) => curr.copy(value),
        default: () => new Vector3(init.x, init.y, init.z),
        ...options,
        id: 'Vec3'
      }
    ),

  /** Vector4 type schema helper, defaults to { x: 0, y: 0, z: 0, w: 0 } */
  Vec4: (init = { x: 0, y: 0, z: 0, w: 0 } as Init<Vector4>, options?: Options<Vector4>) =>
    S.SerializedClass(
      {
        x: S.Number(),
        y: S.Number(),
        z: S.Number(),
        w: S.Number()
      },
      {
        deserialize: (curr, value) => curr.copy(value),
        default: () => new Vector4(init.x, init.y, init.z, init.w),
        ...options,
        id: 'Vec4'
      }
    ),

  /** Quaternion type schema helper, defaults to { x: 0, y: 0, z: 0, w: 1 } */
  Quaternion: (init = { x: 0, y: 0, z: 0, w: 1 } as Init<Quaternion>, options?: Options<Quaternion>) =>
    S.SerializedClass(
      {
        x: S.Number(),
        y: S.Number(),
        z: S.Number(),
        w: S.Number()
      },
      {
        serialize: (value) => value.toJSON(),
        deserialize: (curr, value) => curr.copy(value),
        default: () => new Quaternion(init.x, init.y, init.z, init.w),
        ...options,
        id: 'Quaternion'
      }
    ),

  /** Matrix4 type schema helper, defaults to idenity matrix */
  Mat4: (init = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], options?: Options<Matrix4>) =>
    S.SerializedClass(
      {
        elements: S.Array(S.Number(), {
          maxItems: 16,
          minItems: 16
        })
      },
      {
        deserialize: (curr, value) => curr.copy(value),
        default: () => new Matrix4().fromArray(init),
        ...options,
        id: 'Mat4'
      }
    ),

  /** Vector3 type schema helper, defaults to { x: 0, y: 0, z: 0 } */
  Box3: (init?: Init<Box3>, options?: Options<Box3>) =>
    S.SerializedClass(
      {
        min: T.Vec3(),
        max: T.Vec3()
      },
      {
        deserialize: (curr, value) => curr.copy(value),
        default: () => new Box3(init?.min, init?.max),
        ...options,
        id: 'Box3'
      }
    ),

  /**
   *
   * Schema representing a color
   * Can be a Color object, string or number, but will always serialize as a number
   *
   * @param init default color representation
   * @param options schema options
   * @returns
   */
  Color: (init?: Init<ColorRepresentation>, options?: Options<ColorRepresentation>) =>
    S.SerializedClass<TProperties, ColorRepresentation>(
      {
        r: S.Number(),
        g: S.Number(),
        b: S.Number()
      },
      {
        deserialize: (curr, value) => (curr instanceof Color ? curr.set(value) : new Color(value)),
        serialize: (value) => (value instanceof Color ? value.getHex() : new Color(value).getHex()),
        default: () => (isColorObj(init) ? new Color(init.r, init.g, init.b) : new Color(init)),
        ...options,
        id: 'Color'
      }
    )
}
