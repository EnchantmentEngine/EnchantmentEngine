import RAPIER, { ActiveCollisionTypes, RigidBodyType, ShapeType, Vector } from '@dimforge/rapier3d-compat'

import { Entity } from '@ir-engine/ecs/src/Entity'

import { Schema } from '@ir-engine/hyperflux'

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface Quat {
  x: number
  y: number
  z: number
  w: number
}

export const SceneQueryType = {
  // todo
  // Any: 'Any',
  // Multiple: 'Multiple',
  Closest: 'Closest'
} as const

export type SceneQueryType = (typeof SceneQueryType)[keyof typeof SceneQueryType]

export interface RaycastHit {
  distance: number
  position: Vector
  normal: Vector
  body: RAPIER.RigidBody
  collider: RAPIER.Collider
  entity: Entity
}

export const CollisionEvents = {
  COLLISION_START: 'COLLISION_START',
  COLLISION_PERSIST: 'COLLISION_PERSIST',
  COLLISION_END: 'COLLISION_END',
  TRIGGER_START: 'TRIGGER_START',
  TRIGGER_PERSIST: 'TRIGGER_PERSIST',
  TRIGGER_END: 'TRIGGER_END'
} as const

export type CollisionEvents = (typeof CollisionEvents)[keyof typeof CollisionEvents]

export type ColliderHitEvent = {
  type: CollisionEvents
  bodySelf: RAPIER.RigidBody
  bodyOther: RAPIER.RigidBody
  shapeSelf: RAPIER.Collider
  shapeOther: RAPIER.Collider
  maxForceDirection: null | Vector
  totalForce: null | Vector
}

/** @deprecated */
export type ColliderDescOptions = {
  shapeType?: ShapeType
  bodyType?: RigidBodyType // TODO: This is only required at the root node, should be removed from here?
  isTrigger?: boolean
  friction?: number
  restitution?: number
  collisionLayer?: number
  collisionMask?: number
  activeCollisionTypes?: ActiveCollisionTypes
}

export const BodyTypes = {
  Fixed: 'fixed' as const,
  Dynamic: 'dynamic' as const,
  Kinematic: 'kinematic' as const
}

export type Body = (typeof BodyTypes)[keyof typeof BodyTypes]

export const Shapes = {
  Sphere: 'sphere' as const,
  Capsule: 'capsule' as const,
  Cylinder: 'cylinder' as const,
  Box: 'box' as const,
  Plane: 'plane' as const,
  ConvexHull: 'convex_hull' as const,
  Mesh: 'mesh' as const,
  Heightfield: 'heightfield' as const
}

export const RapierShapeToString = {
  [ShapeType.Ball]: 'sphere' as const,
  [ShapeType.Cuboid]: 'box' as const,
  [ShapeType.Capsule]: 'capsule' as const,
  // [ShapeType.Segment]:
  // [ShapeType.Polyline]:
  // [ShapeType.Triangle]:
  [ShapeType.TriMesh]: 'mesh' as const,
  [ShapeType.HeightField]: 'heightfield' as const,
  [ShapeType.ConvexPolyhedron]: 'convex_hull' as const,
  [ShapeType.Cylinder]: 'cylinder' as const
  // [ShapeType.Cone]:
  // [ShapeType.RoundCuboid]:
  // [ShapeType.RoundTriangle]:
  // [ShapeType.RoundCylinder]:
  // [ShapeType.RoundCone]:
  // [ShapeType.RoundConvexPolyhedron]:
  // [ShapeType.HalfSpace]:
}

export type Shape = (typeof Shapes)[keyof typeof Shapes]
export const ShapeSchema = (init?: Shape) => Schema.LiteralUnion(Object.values(Shapes) as Shape[], { default: init })
