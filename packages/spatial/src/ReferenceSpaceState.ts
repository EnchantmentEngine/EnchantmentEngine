import { UndefinedEntity } from '@ir-engine/ecs'
import { defineState } from '@ir-engine/hyperflux'

export const ReferenceSpaceState = defineState({
  name: 'ReferenceSpaceState',
  initial: {
    /**
     * Represents the reference space of the xr session local floor.
     */
    localFloorEntity: UndefinedEntity,

    /**
     * Represents the reference space for the absolute origin of the rendering context.
     */

    originEntity: UndefinedEntity,

    /**
     * Represents the reference space for the viewer.
     */
    viewerEntity: UndefinedEntity
  }
})
