
import { useEffect } from 'react'
import { BufferGeometry, Color, LineBasicMaterial, LineSegments, Material, NormalBufferAttributes } from 'three'

import { defineComponent, removeComponent, setComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { NO_PROXY, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../../common/NameComponent'
import { T } from '../../schema/schemaFunctions'
import { ObjectLayerMask, ObjectLayerMasks } from '../constants/ObjectLayers'
import { ObjectComponent } from './ObjectComponent'
import { ObjectLayerMaskComponent } from './ObjectLayerComponent'
import { setVisibleComponent } from './VisibleComponent'

export const LineSegmentComponent = defineComponent({
  name: 'LineSegmentComponent',
  jsonID: 'EE_line_segment',

  schema: S.Object({
    name: S.String({ default: 'line-segment' }),
    geometry: S.Type<BufferGeometry>({ required: true }),
    material: S.Class(() => new LineBasicMaterial() as Material),
    color: S.Optional(T.Color()),
    opacity: S.Optional(S.Number({ default: 1 })),
    layerMask: S.Type<ObjectLayerMask>({ default: ObjectLayerMasks.NodeHelper })
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, LineSegmentComponent)
    const lineSegment = useHookstate(
      () =>
        new LineSegments(
          component.geometry.value as BufferGeometry<NormalBufferAttributes>,
          component.material.value as Material
        )
    ).value as LineSegments

    useImmediateEffect(() => {
      setComponent(entity, ObjectComponent, lineSegment)
      setVisibleComponent(entity, true)
      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [])

    useEffect(() => {
      setComponent(entity, NameComponent, component.name.value)
    }, [component.name])

    useEffect(() => {
      ObjectLayerMaskComponent.setMask(entity, component.layerMask.value)
    }, [component.layerMask.value])

    useEffect(() => {
      const color = component.color.value
      if (!color) return
      const mat = component.material.get(NO_PROXY) as Material & { color?: Color }
      if (mat.color) {
        mat.color.set(color)
        mat.needsUpdate = true
      }
    }, [component.color.value])

    useEffect(() => {
      const opacity = component.opacity.value
      if (opacity === undefined) return
      const mat = component.material.get(NO_PROXY) as Material & {
        opacity?: number
        transparent?: boolean
      }

      mat.transparent = opacity < 1
      mat.opacity = opacity
      mat.needsUpdate = true
    }, [component.opacity.value])

    useEffect(() => {
      const geo = component.geometry.get(NO_PROXY) as BufferGeometry<NormalBufferAttributes>
      lineSegment.geometry = geo
      return () => {
        geo.dispose()
      }
    }, [component.geometry.value])

    useEffect(() => {
      const mat = component.material.get(NO_PROXY) as Material
      lineSegment.material = mat
      mat.needsUpdate = true
      return () => {
        mat.dispose()
      }
    }, [component.material.value])

    return null
  }
})
