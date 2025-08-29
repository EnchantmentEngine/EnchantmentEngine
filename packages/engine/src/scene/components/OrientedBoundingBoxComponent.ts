import { Box3 } from 'three'

import { iterateEntityNode } from '@ir-engine/ecs'
import { defineComponent, getOptionalComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { Schema } from '@ir-engine/hyperflux'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { expandBoxByObject } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

export const OrientedBoundingBoxComponent = defineComponent({
  name: 'OrientedBoundingBoxComponent',

  schema: Schema.Object({
    box: T.Box3()
  })
})

export const updateOrientedBoundingBox = (entity: Entity) => {
  const boxComponent = getOptionalComponent(entity, OrientedBoundingBoxComponent)

  if (!boxComponent) {
    console.error('BoundingBoxComponent not found in updateBoundingBox')
    return
  }

  const transform = getOptionalComponent(entity, TransformComponent)
  if (!transform) {
    console.error('TransformComponent not found in updateBoundingBox')
    return
  }

  //set entity transform to identity before calculating bounding box so it is in object space
  const originalMatrixWorld = transform.matrixWorld.clone()
  transform.matrixWorld.identity()
  TransformComponent.updateFromWorldMatrix(entity)
  TransformComponent.computeTransformMatrixWithChildren(entity)

  const box = new Box3()
  box.makeEmpty()

  const callback = (child: Entity) => {
    const obj = getOptionalComponent(child, MeshComponent)
    const coll = getOptionalComponent(child, ColliderComponent)
    if (obj && !coll) expandBoxByObject(obj, box)
  }

  iterateEntityNode(entity, callback)

  //reset entity transform
  transform.matrixWorld.copy(originalMatrixWorld)
  TransformComponent.updateFromWorldMatrix(entity)
  TransformComponent.computeTransformMatrixWithChildren(entity)

  setComponent(entity, OrientedBoundingBoxComponent, { box })
}
