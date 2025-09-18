import {
  createEntity,
  defineComponent,
  EntitySchema,
  EntityTreeComponent,
  getComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { Schema, useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import {
  BoundingBoxComponent,
  updateBoundingBox
} from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { useEffect } from 'react'
import { Box3Helper, BufferGeometry, LineBasicMaterial, LineSegments } from 'three'

export const BoundingBoxHelperComponent = defineComponent({
  name: 'BoundingBoxHelperComponent',

  schema: Schema.Object({
    color: T.Color('white'),
    helperEntity: EntitySchema.Entity()
  }),

  reactor: function () {
    const entity = useEntityContext()
    const boundingBox = useComponent(entity, BoundingBoxComponent)
    const boundingBoxHelper = useComponent(entity, BoundingBoxHelperComponent)

    const helperEntity = useHookstate(() => {
      const helperEntity = createEntity()

      const helper = new Box3Helper(boundingBox.box, boundingBoxHelper.color)
      helper.name = `bounding-box-helper-${entity}`

      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, VisibleComponent)

      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })

      setComponent(helperEntity, ObjectComponent, helper)
      ObjectLayerMaskComponent.setLayer(helperEntity, ObjectLayers.NodeHelper)

      TransformComponent.dirty[entity] = 1 //used to dirty trasform and set the appropate bounding box
      updateBoundingBox(entity)
      setComponent(entity, BoundingBoxHelperComponent, { helperEntity })
      return helperEntity
    }).value

    useEffect(() => {
      return () => {
        removeEntity(helperEntity)
      }
    }, [])

    useEffect(() => {
      const helperObject = getComponent(helperEntity, ObjectComponent) as any as LineSegments<
        BufferGeometry,
        LineBasicMaterial
      >
      helperObject.material.color.set(boundingBoxHelper.color)
    }, [boundingBoxHelper.color])

    return null
  }
})
