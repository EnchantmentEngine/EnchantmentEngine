import { entityExists } from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { Query } from '@ir-engine/ecs/src/QueryFunctions'
import { DeepReadonly } from '@ir-engine/hyperflux'
import { insertionSort } from './insertionSort'

import { DistanceFromCameraComponent, FrustumCullCameraComponent } from '../../transform/components/DistanceComponents'

export const createPriorityQueue = (args: { accumulationBudget: number }) => {
  const accumulatingPriorities = new Map<
    Entity,
    {
      normalizedPriority: number
      accumulatedPriority: number
    }
  >()

  const priorityEntities = new Set<Entity>()

  let totalAccumulation = 0

  const queue = {
    accumulatingPriorities: accumulatingPriorities as DeepReadonly<typeof accumulatingPriorities>,
    removeEntity: (entity: Entity) => {
      accumulatingPriorities.delete(entity)
    },
    addPriority: (entity: Entity, priority: number) => {
      if (!accumulatingPriorities.has(entity))
        accumulatingPriorities.set(entity, { normalizedPriority: 0, accumulatedPriority: 0 })
      const item = accumulatingPriorities.get(entity)!
      item.accumulatedPriority += priority
      totalAccumulation += priority
    },
    update: () => {
      priorityEntities.clear()
      for (const [entity, item] of accumulatingPriorities) {
        item.normalizedPriority += (item.accumulatedPriority * queue.accumulationBudget) / totalAccumulation
        item.accumulatedPriority = 0
        const exists = entityExists(entity)
        if (item.normalizedPriority >= 1 || !exists) {
          if (exists) priorityEntities.add(entity)
          queue.removeEntity(entity)
        }
      }
      totalAccumulation = 0
    },
    priorityEntities: priorityEntities as ReadonlySet<Entity>,
    accumulationBudget: args.accumulationBudget,
    reset: () => {
      totalAccumulation = 0
      accumulatingPriorities.clear()
      priorityEntities.clear()
    }
  }

  return queue
}

const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units

const filterFrustumCulledEntities = (entity: Entity) =>
  !(
    DistanceFromCameraComponent.squaredDistance[entity] > minimumFrustumCullDistanceSqr &&
    FrustumCullCameraComponent.isCulled[entity]
  )

export const createSortAndApplyPriorityQueue = (query: Query, comparisonFunction) => {
  let sortAccumulator = 0

  return (
    priorityQueue: ReturnType<typeof createPriorityQueue>,
    sortedTransformEntities: Entity[],
    deltaSeconds: number
  ) => {
    let needsSorting = false
    sortAccumulator += deltaSeconds
    if (sortAccumulator > 1) {
      needsSorting = true
      sortAccumulator = 0
    }

    for (const entity of query.enter()) {
      sortedTransformEntities.push(entity)
      needsSorting = true
    }

    for (const entity of query.exit()) {
      const idx = sortedTransformEntities.indexOf(entity)
      idx > -1 && sortedTransformEntities.splice(idx, 1)
      needsSorting = true
      priorityQueue.removeEntity(entity)
    }

    if (needsSorting && sortedTransformEntities.length > 1) {
      insertionSort(sortedTransformEntities, comparisonFunction)
    }

    const filteredSortedTransformEntities: Array<Entity> = []
    for (let i = 0; i < sortedTransformEntities.length; i++) {
      if (filterFrustumCulledEntities(sortedTransformEntities[i]))
        filteredSortedTransformEntities.push(sortedTransformEntities[i])
    }

    for (let i = 0; i < filteredSortedTransformEntities.length; i++) {
      const entity = filteredSortedTransformEntities[i]
      const accumulation = Math.min(Math.exp(1 / (i + 1)) / 3, 1)
      priorityQueue.addPriority(entity, accumulation * accumulation)
    }

    priorityQueue.update()
  }
}
