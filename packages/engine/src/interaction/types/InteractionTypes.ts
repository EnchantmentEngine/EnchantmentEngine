import { Entity } from '@ir-engine/ecs/src/Entity'

export type InteractionCheckHandler = (
  clientEntity: Entity,
  interactableEntity: Entity,
  focusedPart?: number,
  args?: any
) => boolean
