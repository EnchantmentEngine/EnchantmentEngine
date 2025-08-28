import { Matrix3, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from 'three'

export const PI = Math.PI
export const HALF_PI = PI / 2
export const TAU = Math.PI * 2

/** const Vector4(0,0,0,0) */
export const Vector4_Zero = Object.freeze(new Vector4(0, 0, 0, 0))

/** const Vector3(0,0,0) */
export const Vector3_Zero = Object.freeze(new Vector3(0, 0, 0))

/** const Vector3(1,0,0) */
export const Vector3_Right = Object.freeze(new Vector3(1, 0, 0))

/** const Vector3(-1,0,0) */
export const Vector3_Left = Object.freeze(new Vector3(-1, 0, 0))

/** const Vector3(0,1,0) */
export const Vector3_Up = Object.freeze(new Vector3(0, 1, 0))

/** const Vector3(0,-1,0) */
export const Vector3_Down = Object.freeze(new Vector3(0, -1, 0))

/** const Vector3(0,0,1) */
export const Vector3_Back = Object.freeze(new Vector3(0, 0, 1))

/** const Vector3(0,0,-1) */
export const Vector3_Forward = Object.freeze(new Vector3(0, 0, -1))

/** const Vector3(1,1,1) */
export const Vector3_One = Object.freeze(new Vector3(1, 1, 1))

/** const Vector2(0,0) */
export const Vector2_Zero = Object.freeze(new Vector2(0, 0))

/** const Vector2(1,0) */
export const Vector2_Right = Object.freeze(new Vector2(1, 0))

/** const Vector2(-1,0) */
export const Vector2_Left = Object.freeze(new Vector2(-1, 0))

/** const Vector2(0,1) */
export const Vector2_Up = Object.freeze(new Vector2(0, 1))

/** const Vector2(0,-1) */
export const Vector2_Down = Object.freeze(new Vector2(0, -1))

/** const Vector2(1,1) */
export const Vector2_One = Object.freeze(new Vector2(1, 1))

/** const Quaternion(0,0,0,1) */
export const Q_IDENTITY = Object.freeze(new Quaternion())

/** Matrix3x3 array in row-major order [1, 0, 0, 0, 1, 0, 0, 0, 1] */
export const MAT3_IDENTITY = Object.freeze(new Matrix3().identity())

/** Matrix4x4 array in row-major order [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] */
export const MAT4_IDENTITY = Object.freeze(new Matrix4().identity())

export const Q_X_90 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Right, HALF_PI))
export const Q_Y_90 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Up, HALF_PI))
export const Q_Z_90 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Back, HALF_PI))

export const Q_X_180 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Right, PI))
export const Q_Y_180 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Up, PI))
export const Q_Z_180 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Back, PI))

export const Q_X_270 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Right, PI + HALF_PI))
export const Q_Y_270 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Up, PI + HALF_PI))
export const Q_Z_270 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Back, PI + HALF_PI))

export const Axis = {
  /** X Axis (1,0,0) */
  X: Vector3_Right,
  /** Y Axis (0,1,0) */
  Y: Vector3_Up,
  /** Z Axis (0,0,1) */
  Z: Vector3_Back
}

Object.freeze(Axis)

/** Right handed coordinate direction */
export const ObjectDirection = {
  /** const Vector3 (1,0,0) */
  Right: Vector3_Right,
  /** const Vector3 (-1,0,0) */
  Left: Vector3_Left,
  /** const Vector3 (0,1,0) */
  Up: Vector3_Up,
  /** const Vector3 (0,-1,0) */
  Down: Vector3_Down,
  /** const Vector3 (0,0,-1) */
  Forward: Vector3_Forward,
  /** const Vector3 (0,0,1) */
  Backward: Vector3_Back
}

Object.freeze(ObjectDirection)
