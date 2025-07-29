import { useEffect } from 'react'
import { Mesh, MeshStandardMaterial } from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { Geometry } from '@ir-engine/spatial/src/common/constants/Geometry'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { DoubleSide } from 'three'
import { GeometryType, GeometryTypeToFactory } from '../constants/GeometryTypeEnum'

const createGeometry = (geometryType: GeometryType, geometryParams: Record<string, any>): Geometry => {
  const factory = GeometryTypeToFactory[geometryType]
  const geometry = factory(geometryParams)
  return geometry
}

export const PrimitiveGeometryComponent = defineComponent({
  name: 'PrimitiveGeometryComponent',
  jsonID: 'EE_primitive_geometry',

  schema: S.Object({
    geometryType: S.Enum(GeometryType, {
      $comment:
        "A string enum, ie. one of the following values: 'BoxGeometry', 'SphereGeometry', 'CylinderGeometry', 'CapsuleGeometry', 'PlaneGeometry', 'CircleGeometry', 'RingGeometry', 'TorusGeometry', 'DodecahedronGeometry', 'IcosahedronGeometry', 'OctahedronGeometry', 'TetrahedronGeometry', 'TorusKnotGeometry'",
      default: GeometryType.BoxGeometry
    }),
    geometryParams: S.Record(S.String(), S.Any())
  }),

  reactor: () => {
    const entity = useEntityContext()
    const geometryComponent = useComponent(entity, PrimitiveGeometryComponent)
    useEffect(() => {
      setComponent(
        entity,
        MeshComponent,
        new Mesh(
          createGeometry(geometryComponent.geometryType, geometryComponent.geometryParams),
          new MeshStandardMaterial({ side: DoubleSide })
        )
      )
      return () => {
        removeComponent(entity, MeshComponent)
      }
    }, [])

    const mesh = useOptionalComponent(entity, MeshComponent)

    useEffect(() => {
      if (!mesh) return
      mesh.geometry = createGeometry(geometryComponent.geometryType, geometryComponent.geometryParams)
    }, [!!mesh, geometryComponent.geometryType, geometryComponent.geometryParams])

    return null
  }
})
