/** Projection Types. */
export const ProjectionType = {
  Orthographic: 0,
  Perspective: 1
} as const

export type ProjectionType = (typeof ProjectionType)[keyof typeof ProjectionType]
