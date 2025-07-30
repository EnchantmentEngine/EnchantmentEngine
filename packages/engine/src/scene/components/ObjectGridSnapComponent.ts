import {
  EngineState,
  Entity,
  EntityTreeComponent,
  S,
  UndefinedEntity,
  createEntity,
  defineComponent,
  getComponent,
  hasComponent,
  iterateEntityNode,
  removeComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { getMutableState, useDidMount, useHookstate, useState } from '@ir-engine/hyperflux'
import { Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { LineSegmentComponent } from '@ir-engine/spatial/src/renderer/components/LineSegmentComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMask, ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { useEffect } from 'react'
import { Box3, BufferGeometry, LineBasicMaterial, Matrix4, Mesh, Quaternion, Vector3 } from 'three'
import { GLTFComponent } from '../../gltf/GLTFComponent'

function createBBoxGridGeometry(matrixWorld: Matrix4, bbox: Box3, density: number): BufferGeometry {
  const lineSegmentList: Vector3[] = []
  const size = new Vector3()
  bbox.getSize(size)

  // Create grid lines for each face of the bounding box

  // Front and back faces (parallel to XY plane)
  const zFront = bbox.min.z
  const zBack = bbox.max.z
  for (let j = 0; j <= density; j++) {
    const segmentFraction = j / density
    const x = bbox.min.x + segmentFraction * size.x
    const y = bbox.min.y + segmentFraction * size.y

    lineSegmentList.push(new Vector3(x, bbox.min.y, zFront), new Vector3(x, bbox.max.y, zFront))
    lineSegmentList.push(new Vector3(x, bbox.min.y, zBack), new Vector3(x, bbox.max.y, zBack))
    lineSegmentList.push(new Vector3(bbox.min.x, y, zFront), new Vector3(bbox.max.x, y, zFront))
    lineSegmentList.push(new Vector3(bbox.min.x, y, zBack), new Vector3(bbox.max.x, y, zBack))
  }

  // Top and bottom faces (parallel to XZ plane)
  const yTop = bbox.max.y
  const yBottom = bbox.min.y
  for (let j = 0; j <= density; j++) {
    const segmentFraction = j / density
    const x = bbox.min.x + segmentFraction * size.x
    const z = bbox.min.z + segmentFraction * size.z

    lineSegmentList.push(new Vector3(x, yTop, bbox.min.z), new Vector3(x, yTop, bbox.max.z))
    lineSegmentList.push(new Vector3(x, yBottom, bbox.min.z), new Vector3(x, yBottom, bbox.max.z))
    lineSegmentList.push(new Vector3(bbox.min.x, yTop, z), new Vector3(bbox.max.x, yTop, z))
    lineSegmentList.push(new Vector3(bbox.min.x, yBottom, z), new Vector3(bbox.max.x, yBottom, z))
  }

  // Left and right faces (parallel to YZ plane)
  const xLeft = bbox.min.x
  const xRight = bbox.max.x
  for (let j = 0; j <= density; j++) {
    const segmentFraction = j / density
    const y = bbox.min.y + segmentFraction * size.y
    const z = bbox.min.z + segmentFraction * size.z

    lineSegmentList.push(new Vector3(xLeft, y, bbox.min.z), new Vector3(xLeft, y, bbox.max.z))
    lineSegmentList.push(new Vector3(xRight, y, bbox.min.z), new Vector3(xRight, y, bbox.max.z))
    lineSegmentList.push(new Vector3(xLeft, bbox.min.y, z), new Vector3(xLeft, bbox.max.y, z))
    lineSegmentList.push(new Vector3(xRight, bbox.min.y, z), new Vector3(xRight, bbox.max.y, z))
  }
  for (let i = 0; i < lineSegmentList.length; i++) {
    lineSegmentList[i].applyMatrix4(matrixWorld)
  }

  return new BufferGeometry().setFromPoints(lineSegmentList)
}

export const BoundingBoxHelperComponent = defineComponent({
  name: 'BoundingBoxHelperComponent',

  schema: S.Object({
    bbox: S.Type<Box3>({ required: true }),
    density: S.Number({ default: 2 }),
    color: T.Color(0xff0000),
    layerMask: S.Type<ObjectLayerMask>({ default: ObjectLayerMasks.NodeHelper }),
    helperEntity: S.Entity()
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, BoundingBoxHelperComponent)

    const lineSegmentedEntity = useHookstate(() => {
      const helperEntity = createEntity()
      const bbox = component.bbox
      const density = component.density
      setComponent(helperEntity, LineSegmentComponent, {
        name: 'bbox-line-segment-' + entity,
        geometry: createBBoxGridGeometry(new Matrix4().identity(), bbox, density),
        material: new LineBasicMaterial({ color: component.color }),
        layerMask: component.layerMask
      })
      setComponent(entity, BoundingBoxHelperComponent, {
        helperEntity: helperEntity
      })
      return helperEntity
    }).value
    const lineSegment = useComponent(lineSegmentedEntity, LineSegmentComponent)

    useEffect(() => {
      return () => {
        removeEntity(lineSegmentedEntity)
      }
    }, [])

    useDidMount(() => {
      const bbox = component.bbox
      const density = component.density
      setComponent(lineSegmentedEntity, LineSegmentComponent, {
        geometry: createBBoxGridGeometry(new Matrix4().identity(), bbox, density)
      })
    }, [component.bbox])

    useEffect(() => {
      setComponent(lineSegmentedEntity, LineSegmentComponent, {
        color: component.color
      })
    }, [component.color, lineSegment])

    useEffect(() => {
      setComponent(lineSegmentedEntity, LineSegmentComponent, {
        layerMask: component.layerMask
      })
    }, [component.layerMask, lineSegment])

    return null
  }
})

const defaultMax = new Vector3(0.5, 0.5, 0.5)
const originalPosition = new Vector3()
const originalRotation = new Quaternion()
const originalScale = new Vector3()

export const ObjectGridSnapComponent = defineComponent({
  name: 'ObjectGridSnapComponent',

  schema: S.Object({
    bbox: S.Class(() => new Box3())
  }),

  reactor: () => {
    const entity = useEntityContext()
    const engineState = useState(getMutableState(EngineState))
    const gltfLoaded = GLTFComponent.useSceneLoaded(entity)
    const snapComponent = useComponent(entity, ObjectGridSnapComponent)

    useEffect(() => {
      if (!gltfLoaded) return
      const originalPosition = new Vector3()
      const originalRotation = new Quaternion()
      const originalScale = new Vector3()
      const originalParent = getComponent(entity, EntityTreeComponent).parentEntity
      const transform = getComponent(entity, TransformComponent)
      transform.matrix.decompose(originalPosition, originalRotation, originalScale)
      //set entity transform to identity before calculating bounding box
      setComponent(entity, EntityTreeComponent, { parentEntity: UndefinedEntity })
      transform.matrixWorld.identity()
      TransformComponent.updateFromWorldMatrix(entity)

      const meshes: Mesh[] = []
      //iterate through children and update their transforms to reflect identity from parent
      iterateEntityNode(entity, (childEntity: Entity) => {
        if (hasComponent(childEntity, TransformComponent)) {
          TransformComponent.computeTransformMatrix(childEntity)
          if (hasComponent(childEntity, MeshComponent)) {
            meshes.push(getComponent(childEntity, MeshComponent))
          }
        }
      })

      //compute bounding box
      const bbox = snapComponent.bbox.makeEmpty()
      if (meshes.length > 0) {
        for (let i = 0; i < meshes.length; i++) {
          bbox.expandByObject(meshes[i])
        }
      } else {
        bbox.set(Vector3_Zero, defaultMax)
      }

      //set entity transform back to original
      setComponent(entity, EntityTreeComponent, { parentEntity: originalParent })
      setComponent(entity, TransformComponent, {
        position: originalPosition,
        rotation: originalRotation,
        scale: originalScale
      })

      iterateEntityNode(entity, TransformComponent.computeTransformMatrix, (childEntity) =>
        hasComponent(childEntity, TransformComponent)
      )

      setComponent(entity, ObjectGridSnapComponent, { bbox })
    }, [gltfLoaded])

    useEffect(() => {
      if (!engineState.isEditing.value) return
      const bbox = snapComponent.bbox
      setComponent(entity, BoundingBoxHelperComponent, { bbox })

      return () => {
        removeComponent(entity, BoundingBoxHelperComponent)
      }
    }, [snapComponent.bbox, engineState.isEditing])

    return null
  }
})
