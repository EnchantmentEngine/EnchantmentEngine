import { BufferGeometry, ColorRepresentation, Material, Matrix3, Matrix4, Quaternion, Vector3 } from 'three'
import { matches } from 'ts-matches'

const matchesVec3Shape = matches.shape({
  x: matches.number,
  y: matches.number,
  z: matches.number
})

const matchesQuatShape = matches.some(
  matches.shape({
    _x: matches.number,
    _y: matches.number,
    _z: matches.number,
    _w: matches.number
  }),
  matches.shape({
    x: matches.number,
    y: matches.number,
    z: matches.number,
    w: matches.number
  })
)

const matchesMat4 = matches.shape({
  elements: matches.tuple(
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number
  )
})

const matchesMat3 = matches.shape({
  elements: matches.tuple(
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number,
    matches.number
  )
})

const matchesColorShape = matches.some(
  matches.string,
  matches.number,
  matches.shape({
    r: matches.number,
    g: matches.number,
    b: matches.number
  }),
  matches.shape({
    h: matches.number,
    s: matches.number,
    l: matches.number
  })
)

const matchesGeometryShape = matches.shape({
  uuid: matches.string,
  isBufferGeometry: matches.literal(true)
})

const matchesMaterialShape = matches.shape({
  uuid: matches.string,
  isMaterial: matches.literal(true)
})

const matchesMeshMaterialShape = matches.some(matchesMaterialShape, matches.arrayOf(matchesMaterialShape))

const matchesVector3 = matches.guard((v): v is Vector3 => matchesVec3Shape.test(v))
const matchesQuaternion = matches.guard((v): v is Quaternion => matchesQuatShape.test(v))
const matchesMatrix4 = matches.guard((m): m is Matrix4 => matchesMat4.test(m))
const matchesMatrix3 = matches.guard((m): m is Matrix3 => matchesMat3.test(m))
const matchesColor = matches.guard((c): c is ColorRepresentation => matchesColorShape.test(c))
const matchesGeometry = matches.guard((b): b is BufferGeometry => matchesGeometryShape.test(b))
const matchesMaterial = matches.guard((m): m is Material => matchesMaterialShape.test(m))
const matchesMeshMaterial = matches.guard((m): m is Material | Material[] => matchesMeshMaterialShape.test(m))

export {
  matchesColor,
  matchesGeometry,
  matchesMaterial,
  matchesMatrix3,
  matchesMatrix4,
  matchesMeshMaterial,
  matchesQuaternion,
  matchesVector3
}
