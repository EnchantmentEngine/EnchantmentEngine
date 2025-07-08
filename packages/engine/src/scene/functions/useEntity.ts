import { useHookstate } from '@hookstate/core'
import { createEntity, Entity, removeEntity, UndefinedEntity } from '@ir-engine/ecs'
import { useEffect } from 'react'

interface EntityOptions {
  setup?: (entity: Entity) => void
  cleanup?: (entity: Entity) => void
}

export const useEntity = ({ setup, cleanup }: EntityOptions = {}) => {
  const entityRef = useHookstate(() => {
    const entity = createEntity()
    setup?.(entity)
    return entity
  })

  useEffect(() => {
    console.log('mounted')
    return () => {
      console.log('cleaning up', entityRef.value)
      cleanup?.(entityRef.value)
      removeEntity(entityRef.value)
      entityRef.set(UndefinedEntity)
    }
  }, [])

  return entityRef.value
}
