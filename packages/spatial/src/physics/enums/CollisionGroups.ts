export const CollisionGroups = {
  None: 0,
  Default: 1 << 0,
  Avatars: 1 << 1,
  Ground: 1 << 2,
  Trigger: 1 << 3
} as const

export type CollisionGroups = (typeof CollisionGroups)[keyof typeof CollisionGroups]

/** Default | Avatars | Ground */
export const DefaultCollisionMask = CollisionGroups.Default | CollisionGroups.Avatars | CollisionGroups.Ground

/** Default | Ground | Trigger */
export const AvatarCollisionMask = CollisionGroups.Default | CollisionGroups.Ground | CollisionGroups.Trigger

/** Default | Avatars | Ground | Trigger */
export const AllCollisionMask =
  CollisionGroups.Default | CollisionGroups.Avatars | CollisionGroups.Ground | CollisionGroups.Trigger
