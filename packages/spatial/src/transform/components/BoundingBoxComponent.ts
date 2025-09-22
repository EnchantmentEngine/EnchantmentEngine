import { Box3, BufferGeometry, Mesh } from 'three'

import { iterateEntityNode } from '@ir-engine/ecs'
import { defineComponent, getOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { Schema } from '@ir-engine/hyperflux'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { T } from '../../schema/schemaFunctions'

export const BOUNDING_BOX_COLORS = {
  SELECTED: 'white',
  HOVERED: '#F3A2FF'
} as const

/**
 * BoundingBoxComponent
 * - Stores an axis-aligned bounding box for an entity
 * - The box is in world space, relative to the entity's position
 */
export const BoundingBoxComponent = defineComponent({
  name: 'BoundingBoxComponent',

  schema: Schema.Object({
    box: T.Box3()
  })
})

export const updateBoundingBox = (entity: Entity) => {
  const boxComponent = getOptionalComponent(entity, BoundingBoxComponent)

  if (!boxComponent) {
    console.error('BoundingBoxComponent not found in updateBoundingBox')
    return
  }

  const box = boxComponent.box
  box.makeEmpty()

  const callback = (child: Entity) => {
    const obj = getOptionalComponent(child, MeshComponent)
    if (obj) expandBoxByObject(obj, box)
  }

  iterateEntityNode(entity, callback)
}

const _box = new Box3()

export const expandBoxByObject = (object: Mesh<BufferGeometry>, box: Box3) => {
  const geometry = object.geometry
  if (!geometry) return

  if (geometry.boundingBox === null) {
    geometry.computeBoundingBox()
  }

  _box.copy(geometry.boundingBox!)
  _box.applyMatrix4(object.matrix)
  box.union(_box)
}

export const BoundingBoxComponentFunctions = {
  expandBoxByObject
}
