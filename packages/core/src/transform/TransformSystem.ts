import { useEffect } from 'react'

import {
  AnimationSystemGroup,
  defineQuery,
  defineSystem,
  Entity,
  EntityTreeComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  LayerComponents,
  Layers,
  NetworkSchemaState
} from '@ir-engine/ecs'
import { getMutableState, none } from '@ir-engine/hyperflux'
import { ComputedTransformComponent } from './ComputedTransformComponent'
import { insertionSort } from './insertionSort'
import { TransformComponent } from './TransformComponent'
import { TransformSerialization } from './TransformSerialization'

const transformQuery = defineQuery([TransformComponent])
const computedTransformQuery = defineQuery([ComputedTransformComponent])

const _transformDepths = new Map<Entity, number>()

const updateTransformDepth = (entity: Entity) => {
  if (_transformDepths.has(entity)) return _transformDepths.get(entity)

  const referenceEntities = getOptionalComponent(entity, ComputedTransformComponent)?.referenceEntities
  const parentEntity = getOptionalComponent(entity, EntityTreeComponent)?.parentEntity

  const referenceEntityDepths = referenceEntities ? referenceEntities.map(updateTransformDepth) : []
  const parentEntityDepth = parentEntity ? updateTransformDepth(parentEntity) : 0
  const depth = Math.max(...referenceEntityDepths, parentEntityDepth) + 1
  _transformDepths.set(entity, depth)

  return depth
}

const compareReferenceDepth = (a: Entity, b: Entity) => {
  const aDepth = _transformDepths.get(a)!
  const bDepth = _transformDepths.get(b)!
  return aDepth - bDepth
}

const authoringTransformQuery = defineQuery([TransformComponent], Layers.Authoring)

export const isDirty = (entity: Entity) => TransformComponent.dirty[entity] === 1

const _sortedTransformEntities = [] as Entity[]

const sortAndMakeDirtyEntities = () => {
  // if transform order is dirty, sort by reference depth
  // Note: cyclic references will cause undefined behavior

  /**
   * Sort transforms if needed
   */

  let needsSorting =
    TransformComponent.transformsNeedSorting ||
    computedTransformQuery.enter().length ||
    computedTransformQuery.exit().length

  for (const entity of transformQuery.enter()) {
    _sortedTransformEntities.push(entity)
    needsSorting = true
  }

  for (const entity of transformQuery.exit()) {
    const idx = _sortedTransformEntities.indexOf(entity)
    idx > -1 && _sortedTransformEntities.splice(idx, 1)
    needsSorting = true
  }

  if (needsSorting) {
    _transformDepths.clear()
    for (const entity of _sortedTransformEntities) updateTransformDepth(entity)
    insertionSort(_sortedTransformEntities, compareReferenceDepth) // Insertion sort is speedy O(n) for mostly sorted arrays
    TransformComponent.transformsNeedSorting = false
  }

  /** Mark the corresponding simulation entity of any authoring layer entities as dirty */
  const dirtyAuthoringEntities = authoringTransformQuery().filter(isDirty)
  for (const entity of dirtyAuthoringEntities) {
    const authoringComponent = getComponent(entity, LayerComponents[Layers.Authoring])
    const linkedEntity = authoringComponent.relations[Layers.Simulation]
    TransformComponent.dirty[entity] = 0
    TransformComponent.dirty[linkedEntity] = 1
  }

  // entities with dirty parent or reference entities, or computed transforms, should also be dirty
  for (const entity of _sortedTransformEntities) {
    TransformComponent.dirty[entity] =
      TransformComponent.dirty[entity] ||
      (hasComponent(entity, ComputedTransformComponent) ? 1 : 0) ||
      TransformComponent.dirty[getOptionalComponent(entity, EntityTreeComponent)?.parentEntity ?? -1] ||
      0
  }
}

const execute = () => {
  const dirtySortedTransformEntities = _sortedTransformEntities.filter(isDirty)
  for (const entity of dirtySortedTransformEntities) TransformComponent.computeTransformMatrix(entity)
}

const reactor = () => {
  useEffect(() => {
    const networkState = getMutableState(NetworkSchemaState)

    networkState[TransformSerialization.ID].set({
      read: TransformSerialization.readTransform,
      write: TransformSerialization.writeTransform
    })

    return () => {
      networkState[TransformSerialization.ID].set(none)
      _sortedTransformEntities.length = 0
      _transformDepths.clear()
    }
  }, [])
  return null
}

export const TransformSystem = defineSystem({
  uuid: 'ee.engine.TransformSystem',
  insert: { after: AnimationSystemGroup },
  execute,
  reactor
})

export const TransformDirtyUpdateSystem = defineSystem({
  uuid: 'ee.engine.TransformDirtyUpdateSystem',
  insert: { before: TransformSystem },
  execute: sortAndMakeDirtyEntities
})

export const TransformDirtyCleanupSystem = defineSystem({
  uuid: 'ee.engine.TransformDirtyCleanupSystem',
  insert: { after: TransformSystem },
  execute: () => {
    TransformComponent.dirty.fill(0)
  }
})
