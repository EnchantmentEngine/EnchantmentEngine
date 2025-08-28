import { SchemaDefinition } from '@ir-engine/hyperflux'
import { Color, Euler, Quaternion, Texture, Vector2, Vector3, Vector4 } from 'three'

/** @todo copied from defineMaterialPlugin in engine package, will be removed once prototypes are fully removed  */
export const isTextureUniform = (uniformSchema: SchemaDefinition) => !!uniformSchema.options?.metadata?.$isTexture

export const BoolArg = { default: false, type: 'boolean' }

export const FloatArg = { default: 0.0, type: 'float' }
export const NormalizedFloatArg = { ...FloatArg, min: 0.0, max: 1.0 }

export const Vec2Arg = { default: [1, 1], type: 'vec2' }
export const Vec3Arg = { default: [1, 1, 1], type: 'vec3' }
export const Vec4Arg = { default: [1, 1, 1, 1], type: 'vec4' }
export const EulerArg = { default: new Euler(), type: 'euler' }
export const ColorArg = { default: new Color(), type: 'color' }

export const TextureArg = { default: null, type: 'texture' }

export const SelectArg = { default: '', options: [], type: 'select' }
export const StringArg = { default: '', type: 'string' }
export const ShaderArg = { default: '', type: 'shader' }

export const ObjectArg = { default: {}, type: 'object' }

export function getDefaultType(value, schema?: SchemaDefinition) {
  if (schema && isTextureUniform(schema)) return TextureArg.type
  switch (typeof value) {
    case 'boolean':
      return BoolArg.type
    case 'string':
      return StringArg.type
    case 'number':
      return FloatArg.type
    case 'object':
      if ((value as Texture)?.isTexture) return TextureArg.type
      if ((value as Color)?.isColor) return ColorArg.type
      if ((value as Vector2)?.isVector2) return Vec2Arg.type
      if ((value as Vector3)?.isVector3) return Vec3Arg.type
      if ((value as Quaternion)?.isQuaternion || (value as Vector4)?.isVector4) return Vec4Arg.type
      if ((value as Euler)?.isEuler) return EulerArg.type
      return ''
    //todo: selects, objects
    default:
      return ''
  }
}

export function generateDefaults(value, schema?: SchemaDefinition) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([k, v]) => getDefaultType(v, schema?.properties?.[k]))
      .map(([k, v]) => {
        return [
          k,
          {
            type: getDefaultType(v, schema?.properties?.[k]),
            default: v
          }
        ]
      })
  )
}
