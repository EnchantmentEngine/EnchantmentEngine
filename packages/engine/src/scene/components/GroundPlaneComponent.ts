import { useEffect, useLayoutEffect } from 'react'
import { Mesh, MeshLambertMaterial, MeshStandardMaterial, PlaneGeometry, ShadowMaterial } from 'three'

import { EntityID, EntityTreeComponent, EntityUUID, useEntityContext, UUIDComponent } from '@ir-engine/ecs'
import {
  createEntity,
  defineComponent,
  removeComponent,
  removeEntity,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { State } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes, Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

export const GroundPlaneComponent = defineComponent({
  name: 'GroundPlaneComponent',
  jsonID: 'EE_ground_plane',

  schema: S.Object({
    color: T.Color(0xffffff),
    visible: S.Bool({ default: true })
  }),

  reactor: function () {
    const entity = useEntityContext()

    const component = useComponent(entity, GroundPlaneComponent)

    const source = UUIDComponent.getAsSourceID(entity)
    const materialID = 'ground-plane-material' as EntityID

    useLayoutEffect(() => {
      setComponent(entity, ObjectLayerMaskComponent, ObjectLayerMasks.Scene)
      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(entity, ColliderComponent, {
        shape: Shapes.Plane,
        collisionLayer: CollisionGroups.Ground,
        collisionMask: CollisionGroups.Default | CollisionGroups.Avatars
      })
      return () => {
        removeComponent(entity, RigidBodyComponent)
        removeComponent(entity, ColliderComponent)
      }
    }, [])

    useEffect(() => {
      const materialEntity = createEntity()
      setComponent(materialEntity, NameComponent, 'GroundPlaneMaterial')

      const materialObject = new MeshStandardMaterial()
      materialObject.polygonOffset = true
      materialObject.polygonOffsetFactor = -0.01
      materialObject.polygonOffsetUnits = 1
      setComponent(materialEntity, UUIDComponent, {
        entitySourceID: source,
        entityID: materialID
      })
      setComponent(materialEntity, EntityTreeComponent, { parentEntity: entity })
      setComponent(materialEntity, MaterialStateComponent, {
        material: materialObject
      })

      const mesh = new Mesh(new PlaneGeometry(10000, 10000))
      mesh.geometry.rotateX(-Math.PI / 2)
      mesh.name = 'GroundPlaneMesh'

      setComponent(entity, MeshComponent, mesh)
      setComponent(entity, MaterialInstanceComponent, {
        entities: [materialEntity]
      })

      return () => {
        removeComponent(entity, MeshComponent)
        removeEntity(materialEntity)
      }
    }, [component.visible.value])

    const meshComponent = useOptionalComponent(entity, MeshComponent) as any as State<
      Mesh<any, MeshLambertMaterial | ShadowMaterial>
    >

    const material = useOptionalComponent(
      UUIDComponent.useEntityByUUID((source + materialID) as EntityUUID),
      MaterialStateComponent
    )?.material

    useLayoutEffect(() => {
      if (!meshComponent || !material) return
      const color = component.color.value
      if (meshComponent.material.color.value == color) return
      meshComponent.material.color.value.set(component.color.value)
    }, [component.color, material])

    return null
  }
})
