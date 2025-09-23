import React, { useEffect } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Vector3
} from 'three'

import {
  createEntity,
  defineSystem,
  Entity,
  EntityTreeComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  QueryReactor,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'

import { RapierWorldState } from '../physics/classes/Physics'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { ObjectComponent } from '../renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '../renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '../renderer/components/VisibleComponent'
import { ObjectLayerMasks, ObjectLayers } from '../renderer/constants/ObjectLayers'
import { RendererState } from '../renderer/RendererState'
import { WebGLRendererSystem } from '../renderer/WebGLRendererSystem'
import { ComputedTransformComponent } from '../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { BoneComponent } from './components/BoneComponent'
import { createInfiniteGridHelper } from './components/InfiniteGridHelper'
import { LineSegmentComponent } from './components/LineSegmentComponent'
import { SceneComponent } from './components/SceneComponents'
import { SkinnedMeshComponent } from './components/SkinnedMeshComponent'

const PhysicsDebugEntities = new Map<Entity, Entity>()

const execute = () => {
  for (const [id, physicsDebugEntity] of Array.from(PhysicsDebugEntities)) {
    const world = getState(RapierWorldState)[id]
    if (!world) continue
    const lineSegments = getOptionalComponent(physicsDebugEntity, ObjectComponent) as any as LineSegments
    if (!lineSegments) continue
    const debugRenderBuffer = world.debugRender()
    lineSegments.geometry.setAttribute('position', new BufferAttribute(debugRenderBuffer.vertices, 3))
    lineSegments.geometry.setAttribute('color', new BufferAttribute(debugRenderBuffer.colors, 4))
  }
}

const PhysicsReactor = () => {
  const entity = useEntityContext()

  useEffect(() => {
    /** @todo move physics debug to physics module */

    const lineSegmentsEntity = createEntity()
    setVisibleComponent(lineSegmentsEntity, true)
    setComponent(lineSegmentsEntity, LineSegmentComponent, {
      layerMask: ObjectLayerMasks.PhysicsHelper,
      name: 'Physics Debug Renderer',
      geometry: new BufferGeometry(),
      material: new LineBasicMaterial({ vertexColors: true, toneMapped: false, depthTest: false, transparent: true })
    })

    setComponent(lineSegmentsEntity, EntityTreeComponent, { parentEntity: entity })

    setComponent(lineSegmentsEntity, ObjectLayerMaskComponent, ObjectLayers.PhysicsHelper)
    PhysicsDebugEntities.set(entity, lineSegmentsEntity)

    return () => {
      removeEntity(lineSegmentsEntity)
      PhysicsDebugEntities.delete(entity)
    }
  }, [])

  return null
}

const SkinnedMeshReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const component = useComponent(entity, SkinnedMeshComponent)

  useEffect(() => {
    const root = getComponent(entity, SkinnedMeshComponent)
    const bones = root.skeleton.bones //getBoneList(entity)

    const geometry = new BufferGeometry()

    const vertices = [] as number[]
    const colors = [] as number[]

    const color1 = new Color(0, 0, 1)
    const color2 = new Color(0, 1, 0)

    for (let i = 0; i < bones.length; i++) {
      const bone = bones[i]

      const boneParentEntity = getComponent(bone.entity!, EntityTreeComponent).parentEntity
      const boneParentComponent = hasComponent(boneParentEntity, BoneComponent)

      if (boneParentComponent) {
        vertices.push(0, 0, 0)
        vertices.push(0, 0, 0)
        colors.push(color1.r, color1.g, color1.b)
        colors.push(color2.r, color2.g, color2.b)
      }
    }

    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))

    const material = new LineBasicMaterial({
      vertexColors: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      transparent: true
    })

    const helperEntity = createEntity()
    setVisibleComponent(helperEntity, true)
    setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
    setComponent(helperEntity, LineSegmentComponent, {
      geometry,
      material,
      name: `Skinned Mesh Helper For: ${entity}`,
      layerMask: ObjectLayerMasks.AvatarHelper
    })

    setComponent(helperEntity, ComputedTransformComponent, {
      referenceEntities: [entity],
      computeFunction: () => {
        const position = geometry.getAttribute('position')

        _matrixWorldInv.copy(root.matrixWorld).invert()

        for (let i = 0, j = 0; i < bones.length; i++) {
          const bone = bones[i]

          const boneParentEntity = getComponent(bone.entity!, EntityTreeComponent).parentEntity
          const boneParentComponent = getOptionalComponent(boneParentEntity, BoneComponent)

          if (boneParentComponent) {
            _boneMatrix.multiplyMatrices(_matrixWorldInv, bone.matrixWorld)
            _vector.setFromMatrixPosition(_boneMatrix)
            position.setXYZ(j, _vector.x, _vector.y, _vector.z)

            _boneMatrix.multiplyMatrices(
              _matrixWorldInv,
              getComponent(boneParentEntity, TransformComponent).matrixWorld
            )
            _vector.setFromMatrixPosition(_boneMatrix)
            position.setXYZ(j + 1, _vector.x, _vector.y, _vector.z)

            j += 2
          }
        }

        geometry.getAttribute('position').needsUpdate = true
      }
    })

    return () => {
      removeEntity(helperEntity)
      geometry.dispose()
      material.dispose()
    }
  }, [component.skeleton])

  return null
}

const _vector = new Vector3()
const _boneMatrix = new Matrix4()
const _matrixWorldInv = new Matrix4()

const reactor = () => {
  const rendererSettings = useMutableState(RendererState)
  const originEntity = useMutableState(ReferenceSpaceState).originEntity.value

  useEffect(() => {
    if (!rendererSettings.gridVisibility.value || !originEntity) return

    const infiniteGridHelperEntity = createInfiniteGridHelper()
    setComponent(infiniteGridHelperEntity, EntityTreeComponent, { parentEntity: originEntity })
    getMutableState(RendererState).infiniteGridHelperEntity.set(infiniteGridHelperEntity)
    return () => {
      removeEntity(infiniteGridHelperEntity)
      getMutableState(RendererState).infiniteGridHelperEntity.set(null)
    }
  }, [originEntity, rendererSettings.gridVisibility])

  return (
    <>
      {rendererSettings.physicsDebug.value && (
        <QueryReactor Components={[SceneComponent]} ChildEntityReactor={PhysicsReactor} />
      )}
      {rendererSettings.avatarDebug.value && (
        <QueryReactor Components={[SkinnedMeshComponent]} ChildEntityReactor={SkinnedMeshReactor} />
      )}
    </>
  )
}

export const DebugRendererSystem = defineSystem({
  uuid: 'ee.engine.DebugRendererSystem',
  insert: { before: WebGLRendererSystem },
  execute,
  reactor
})
