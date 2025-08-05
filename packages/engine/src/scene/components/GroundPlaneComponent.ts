import { useEffect } from 'react'
import { Mesh, PlaneGeometry } from 'three'

import { useHookstate } from '@hookstate/core'
import {
  EntityID,
  EntityTreeComponent,
  SourceID,
  UndefinedEntity,
  useEntityContext,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  createEntity,
  defineComponent,
  removeComponent,
  removeEntity,
  setComponent,
  useComponent,
  useHasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MaterialComponent, MaterialInstanceComponent } from '@ir-engine/spatial/src/materials/MaterialComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes, Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
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

    const uuid = useComponent(entity, UUIDComponent)
    const source = (uuid || 'ground-plane-source') as unknown as SourceID
    const materialID = 'ground-plane-material' as EntityID

    useEffect(() => {
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

    const materialEntityState = useHookstate(UndefinedEntity)

    useEffect(() => {
      const materialEntity = createEntity()
      setComponent(materialEntity, NameComponent, 'GroundPlaneMaterial')

      /** @todo add back polygon offset */
      // const materialObject = new MeshStandardMaterial()
      // materialObject.polygonOffset = true
      // materialObject.polygonOffsetFactor = -0.01
      // materialObject.polygonOffsetUnits = 1
      setComponent(materialEntity, UUIDComponent, {
        entitySourceID: source,
        entityID: materialID
      })
      setComponent(materialEntity, EntityTreeComponent, { parentEntity: entity })
      setComponent(materialEntity, MaterialComponent, { diffuse: component.color })

      const mesh = new Mesh(new PlaneGeometry(10000, 10000))
      mesh.geometry.rotateX(-Math.PI / 2)
      mesh.name = 'GroundPlaneMesh'

      setComponent(entity, MeshComponent, mesh)
      setComponent(entity, MaterialInstanceComponent, {
        entities: [materialEntity]
      })

      materialEntityState.set(materialEntity)

      return () => {
        materialEntityState.set(UndefinedEntity)
        removeComponent(entity, MeshComponent)
        removeEntity(materialEntity)
      }
    }, [])

    const material = useHasComponent(materialEntityState.value, MaterialComponent)

    useEffect(() => {
      if (!material) return
      setComponent(materialEntityState.value, MaterialComponent, { diffuse: component.color })
    }, [component.color, material])

    return null
  }
})
