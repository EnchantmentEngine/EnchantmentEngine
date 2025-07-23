// Create a bit wise mask that conforms with RAPIER.InteractionGroups bit structure.
/** @todo move this inside the Physics.ts API and expose collisionGroup and collisionMask instead of calling this directly */
export const getInteractionGroups = (collisionGroup: number, collisionMask: number) => {
  let interactionGroups = collisionGroup << 16
  interactionGroups |= collisionMask
  return interactionGroups
}
