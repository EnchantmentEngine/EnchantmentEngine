import { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, ShadowMaterial } from 'three'

import {
  Engine,
  Entity,
  EntityTreeComponent,
  S,
  createEntity,
  defineComponent,
  getComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'

import { getState } from '@ir-engine/hyperflux'

import { NameComponent } from '../common/NameComponent'
import { MeshComponent } from '../renderer/components/MeshComponent'
import { setVisibleComponent } from '../renderer/components/VisibleComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { ReferenceSpace, XRState } from './XRState'

export const placementHelperMaterial = new MeshBasicMaterial({
  color: 'grey',
  wireframe: false,
  opacity: 0.5,
  transparent: true
})
export const shadowMaterial = new ShadowMaterial({ opacity: 0.5, color: 0x0a0a0a, colorWrite: false })
shadowMaterial.polygonOffset = true
shadowMaterial.polygonOffsetFactor = -0.01

export const XRDetectedPlaneComponentState = defineComponent({
  name: 'XRDetectedPlaneComponentState',
  initial: () => ({
    detectedPlanesMap: new Map<XRPlane, Entity>(),
    planesLastChangedTimes: new Map<XRPlane, number>()
  })
})

export const XRDetectedPlaneComponent = defineComponent({
  name: 'XRDetectedPlaneComponent',

  schema: S.Object({
    plane: S.Type<XRPlane>(),
    // internal
    shadowMesh: S.Type<Mesh>({ serialized: false }),
    geometry: S.Type<BufferGeometry>({ serialized: false }),
    placementHelper: S.Type<Mesh>({ serialized: false })
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, XRDetectedPlaneComponent)

    useEffect(() => {
      return () => {
        component.geometry?.dispose()
      }
    }, [])

    // useEffect(() => {
    //   const placementHelper = component.placementHelper.get(NO_PROXY) as Mesh
    //   placementHelper.visible = scenePlacementMode.value === 'placing'
    // }, [scenePlacementMode])

    return null
  },

  createGeometryFromPolygon: (plane: XRPlane) => {
    const geometry = new BufferGeometry()
    const polygon = plane.polygon

    const vertices = [] as number[]
    const uvs = [] as number[]

    for (const point of polygon) {
      vertices.push(point.x, point.y, point.z)
      uvs.push(point.x, point.z)
    }

    const indices = [] as number[]
    for (let i = 2; i < polygon.length; ++i) {
      indices.push(0, i - 1, i)
    }

    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    return geometry
  },

  updatePlaneGeometry: (entity: Entity) => {
    const state = getState(XRDetectedPlaneComponentState)
    const plane = getComponent(entity, XRDetectedPlaneComponent).plane
    const lastKnownTime = state.planesLastChangedTimes.get(plane)!
    if (plane.lastChangedTime > lastKnownTime) {
      state.planesLastChangedTimes.set(plane, plane.lastChangedTime)
      const geometry = XRDetectedPlaneComponent.createGeometryFromPolygon(plane)
      const planeComponent = getComponent(entity, XRDetectedPlaneComponent)
      planeComponent.geometry?.dispose()
      planeComponent.shadowMesh?.geometry.dispose()
      const mesh = new Mesh(geometry, shadowMaterial)
      setComponent(entity, MeshComponent, mesh)
      planeComponent.geometry = geometry
      planeComponent.shadowMesh = mesh
    }
  },

  updatePlanePose: (entity: Entity) => {
    const plane = getComponent(entity, XRDetectedPlaneComponent).plane
    const planePose = getState(XRState).xrFrame!.getPose(plane.planeSpace, ReferenceSpace.localFloor!)!
    if (!planePose) return
    TransformComponent.position.x[entity] = planePose.transform.position.x
    TransformComponent.position.y[entity] = planePose.transform.position.y
    TransformComponent.position.z[entity] = planePose.transform.position.z
    TransformComponent.rotation.x[entity] = planePose.transform.orientation.x
    TransformComponent.rotation.y[entity] = planePose.transform.orientation.y
    TransformComponent.rotation.z[entity] = planePose.transform.orientation.z
    TransformComponent.rotation.w[entity] = planePose.transform.orientation.w
  },

  getPlaneEntity: (plane: XRPlane) => {
    const state = getState(XRDetectedPlaneComponentState)
    if (state.detectedPlanesMap.has(plane)) {
      return state.detectedPlanesMap.get(plane)!
    }
    const entity = createEntity()
    setComponent(entity, EntityTreeComponent, { parentEntity: Engine.instance.localFloorEntity })
    setComponent(entity, TransformComponent)
    setVisibleComponent(entity, true)
    setComponent(entity, XRDetectedPlaneComponent, { plane })
    setComponent(entity, NameComponent, 'xrplane-' + planeId++ + '-' + plane.semanticLabel)
    state.planesLastChangedTimes.set(plane, -1)
    state.detectedPlanesMap.set(plane, entity)
    return entity
  },

  purgeExpiredPlanes: (detectedPlanes: XRPlaneSet) => {
    const state = getState(XRDetectedPlaneComponentState)
    for (const [plane, entity] of state.detectedPlanesMap) {
      if (detectedPlanes.has(plane)) continue
      state.detectedPlanesMap.delete(plane)
      state.planesLastChangedTimes.delete(plane)
      removeEntity(entity)
    }
  },

  updateDetectedPlanes: (detectedPlanes: XRPlaneSet) => {
    XRDetectedPlaneComponent.purgeExpiredPlanes(detectedPlanes)
    for (const plane of detectedPlanes) {
      const entity = XRDetectedPlaneComponent.getPlaneEntity(plane)
      XRDetectedPlaneComponent.updatePlaneGeometry(entity)
      XRDetectedPlaneComponent.updatePlanePose(entity)
    }
  }
})

let planeId = 0
