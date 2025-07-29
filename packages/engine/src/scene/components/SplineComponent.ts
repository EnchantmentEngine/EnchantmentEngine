import { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Line, LineBasicMaterial, Quaternion, Vector3 } from 'three'

import { EntityTreeComponent, useEntityContext } from '@ir-engine/ecs'
import {
  createEntity,
  defineComponent,
  getComponent,
  removeEntity,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

export const SplineComponent = defineComponent({
  name: 'SplineComponent',
  jsonID: 'EE_spline',

  schema: S.Object({
    elements: S.Array(
      S.Object({
        position: T.Vec3(),
        rotation: T.Quaternion()
      }),
      {
        default: () => [
          { position: new Vector3(-1, 0, -1), rotation: new Quaternion() },
          {
            position: new Vector3(1, 0, -1),
            rotation: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI / 2)
          },
          {
            position: new Vector3(1, 0, 1),
            rotation: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI)
          },
          {
            position: new Vector3(-1, 0, 1),
            rotation: new Quaternion().setFromAxisAngle(Vector3_Up, (3 * Math.PI) / 2)
          }
        ]
      }
    ),
    curve: S.Class(() => new CatmullRomCurve3([], true), { serialized: false })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, SplineComponent)
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const elements = component.elements

    useEffect(() => {
      if (elements.length < 3) {
        setComponent(entity, SplineComponent, { curve: new CatmullRomCurve3([], true) })
        return
      }

      const curve = new CatmullRomCurve3(
        elements.map((e) => e.position),
        true
      )
      curve.curveType = 'catmullrom'
      setComponent(entity, SplineComponent, { curve })
    }, [
      elements.length,
      // force a unique dep change upon any position or quaternion change
      elements.map((e) => `${JSON.stringify(e.position)}${JSON.stringify(e.rotation)})`).join('')
    ])

    useEffect(() => {
      if (!debugEnabled.value || elements.length < 3) return

      const ARC_SEGMENTS = 200
      const _point = new Vector3()
      const lineMaterial = () => new LineBasicMaterial({ color: 'white', opacity: 0.35 })
      const createLineGeom = () => {
        const lineGeometry = new BufferGeometry()
        lineGeometry.setAttribute('position', new BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3))
        return lineGeometry
      }

      const splineHelperEntity = createEntity()

      setComponent(splineHelperEntity, TransformComponent)
      setComponent(splineHelperEntity, EntityTreeComponent, { parentEntity: entity })
      setComponent(splineHelperEntity, VisibleComponent)
      setComponent(splineHelperEntity, ObjectComponent, new Line(createLineGeom(), lineMaterial()))

      const line = getComponent(splineHelperEntity, ObjectComponent) as Line
      const curve = component.curve

      const positions = line.geometry.attributes.position
      for (let i = 0; i < ARC_SEGMENTS; i++) {
        const t = i / (ARC_SEGMENTS - 1)
        curve.getPoint(t, _point)
        positions.setXYZ(i, _point.x, _point.y, _point.z)
      }
      positions.needsUpdate = true

      return () => {
        removeEntity(splineHelperEntity)
      }
    }, [debugEnabled, component.curve])

    return null
  }
})
