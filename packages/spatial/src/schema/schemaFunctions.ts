import { Box3, Color, ColorRepresentation, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from 'three'

import { Options, Schema, TProperties } from '@ir-engine/hyperflux'

const isColorObj = (color?: ColorRepresentation): color is Color => {
  return color !== undefined && (color as Color).r !== undefined
}

type Init<T> = T

export const T = {
  /** Vector2 type schema helper, defaults to { x: 0, y: 0 } */
  Vec2: (init = { x: 0, y: 0 } as Init<Vector2>, options?: Options<Vector2>) =>
    Schema.SerializedClass(
      {
        x: Schema.Number(),
        y: Schema.Number()
      },
      {
        deserialize: (curr, value) => curr.copy(value),
        default: () => new Vector2(init.x, init.y),
        ...options,
        $id: 'Vec2'
      }
    ),

  /** Vector3 type schema helper, defaults to { x: 0, y: 0, z: 0 } */
  Vec3: (init = { x: 0, y: 0, z: 0 } as Init<Vector3>, options?: Options<Vector3>) =>
    Schema.SerializedClass(
      {
        x: Schema.Number(),
        y: Schema.Number(),
        z: Schema.Number()
      },
      {
        deserialize: (curr, value) => curr.copy(value),
        default: () => new Vector3(init.x, init.y, init.z),
        ...options,
        $id: 'Vec3'
      }
    ),

  /** Vector4 type schema helper, defaults to { x: 0, y: 0, z: 0, w: 0 } */
  Vec4: (init = { x: 0, y: 0, z: 0, w: 0 } as Init<Vector4>, options?: Options<Vector4>) =>
    Schema.SerializedClass(
      {
        x: Schema.Number(),
        y: Schema.Number(),
        z: Schema.Number(),
        w: Schema.Number()
      },
      {
        deserialize: (curr, value) => curr.copy(value),
        default: () => new Vector4(init.x, init.y, init.z, init.w),
        ...options,
        $id: 'Vec4'
      }
    ),

  /** Quaternion type schema helper, defaults to { x: 0, y: 0, z: 0, w: 1 } */
  Quaternion: (init = { x: 0, y: 0, z: 0, w: 1 } as Init<Quaternion>, options?: Options<Quaternion>) =>
    Schema.SerializedClass(
      {
        x: Schema.Number(),
        y: Schema.Number(),
        z: Schema.Number(),
        w: Schema.Number()
      },
      {
        serialize: (value) => value.toJSON(),
        deserialize: (curr, value) => curr.copy(value),
        default: () => new Quaternion(init.x, init.y, init.z, init.w),
        ...options,
        $id: 'Quaternion'
      }
    ),

  /** Matrix4 type schema helper, defaults to idenity matrix */
  Mat4: (init = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], options?: Options<Matrix4>) =>
    Schema.SerializedClass(
      {
        elements: Schema.Array(Schema.Number(), {
          maxItems: 16,
          minItems: 16
        })
      },
      {
        deserialize: (curr, value) => curr.copy(value),
        default: () => new Matrix4().fromArray(init),
        ...options,
        $id: 'Mat4'
      }
    ),

  /** Vector3 type schema helper, defaults to { x: 0, y: 0, z: 0 } */
  Box3: (init?: Init<Box3>, options?: Options<Box3>) =>
    Schema.SerializedClass(
      {
        min: T.Vec3(),
        max: T.Vec3()
      },
      {
        deserialize: (curr, value) => curr.copy(value),
        default: () => new Box3(init?.min, init?.max),
        ...options,
        $id: 'Box3'
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
    Schema.SerializedClass<TProperties, ColorRepresentation>(
      {
        r: Schema.Number(),
        g: Schema.Number(),
        b: Schema.Number()
      },
      {
        deserialize: (curr, value) => (curr instanceof Color ? curr.set(value) : new Color(value)),
        serialize: (value) => (value instanceof Color ? value.getHex() : new Color(value).getHex()),
        default: () => (isColorObj(init) ? new Color(init.r, init.g, init.b) : new Color(init)),
        ...options,
        $id: 'Color'
      }
    )
}
