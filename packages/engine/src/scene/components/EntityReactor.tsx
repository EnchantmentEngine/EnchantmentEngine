import { Entity } from '@ir-engine/ecs'
import { useEntity } from '../functions/useEntity'

export type EntityReactorProps = {
  setup?: (entity: Entity) => void
  cleanup?: (entity: Entity) => void
}

export const EntityReactor = ({ setup, cleanup }: EntityReactorProps) => {
  useEntity({ setup, cleanup })

  return null
}
