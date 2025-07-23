import { useEffect } from 'react'
import { Box3, Box3Helper, BufferGeometry, Mesh, Vector3 } from 'three'

import {
  EntityTreeComponent,
  UndefinedEntity,
  createEntity,
  iterateEntityNode,
  removeEntity,
  useEntityContext
} from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../../common/NameComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '../../renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { T } from '../../schema/schemaFunctions'
import { TransformComponent } from './TransformComponent'

export const BOUNDING_BOX_COLORS = {
  SELECTED: 'white',
  HOVERED: '#F3A2FF'
} as const

export const BoundingBoxComponent = defineComponent({
  name: 'BoundingBoxComponent',

  schema: S.Object({
    box: T.Box3(),
    helper: S.Entity(),
    color: T.Color('white')
  }),

  reactor: function () {
    const entity = useEntityContext()
    const boundingBox = useComponent(entity, BoundingBoxComponent)

    useEffect(() => {
      const helperEntity = createEntity()

      const helper = new Box3Helper(boundingBox.box.value, boundingBox.color.value)
      helper.name = `bounding-box-helper-${entity}`

      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, VisibleComponent)

      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })

      setComponent(helperEntity, ObjectComponent, helper)
      ObjectLayerMaskComponent.setLayer(helperEntity, ObjectLayers.NodeHelper)
      boundingBox.helper.set(helperEntity)

      TransformComponent.dirty[entity] = 1 //used to dirty trasform and set the appropate bounding box
      updateBoundingBox(entity)

      return () => {
        removeEntity(helperEntity)
      }
    }, [])

    useEffect(() => {
      const helperEntity = boundingBox.helper.value
      if (helperEntity === UndefinedEntity) return

      const helperObject = getComponent(helperEntity, ObjectComponent) as any as Box3Helper
      ;(helperObject.material as any).color.set(boundingBox.color.value)
    }, [boundingBox.helper, boundingBox.color])

    return null
  }
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

  /** helper has custom logic in updateMatrixWorld */
  const transform = getOptionalComponent(entity, TransformComponent)
  if (!transform) return

  const boundingBox = getComponent(entity, BoundingBoxComponent)
  const boxOffset = box.getCenter(new Vector3())

  const helperEntity = boundingBox.helper
  if (!helperEntity) return

  const helperObject = getComponent(helperEntity, ObjectComponent) as any as Box3Helper
  helperObject.position.set(boxOffset.x, boxOffset.y, boxOffset.z)
  helperObject.updateMatrixWorld(true)
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
