import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  SkinnedMesh,
  Vector3
} from 'three'

import {
  createEntity,
  defineComponent,
  EntityTreeComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  S,
  setComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@ir-engine/ecs'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { NameComponent } from '../../common/NameComponent'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { RendererState } from '../RendererState'
import { BoneComponent } from './BoneComponent'
import { MeshComponent } from './MeshComponent'
import { addObjectToGroup } from './ObjectComponent'
import { setObjectLayers } from './ObjectLayerComponent'
import { setVisibleComponent, VisibleComponent } from './VisibleComponent'

export const SkinnedMeshComponent = defineComponent({
  name: 'SkinnedMeshComponent',
  schema: S.Type<SkinnedMesh>({ required: true }),

  onSet(entity, component, json) {
    SkinnedMeshComponent.valueMap[entity] = json as SkinnedMesh
    setComponent(entity, MeshComponent, json as SkinnedMesh)
  },

  onRemove(entity, component) {
    removeComponent(entity, MeshComponent)
  },

  /** @todo move this to a system */
  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, SkinnedMeshComponent)

    const debugEnabled = useHookstate(getMutableState(RendererState).avatarDebug)
    const visible = useOptionalComponent(entity, VisibleComponent)

    useEffect(() => {
      if (!visible?.value || !debugEnabled.value) return

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

      const line = new LineSegments(geometry, material)

      line.frustumCulled = false
      line.name = `Skinned Mesh Helper For: ${entity}`

      const helperEntity = createEntity()
      setVisibleComponent(helperEntity, true)
      addObjectToGroup(helperEntity, line)
      setComponent(helperEntity, NameComponent, line.name)
      setObjectLayers(line, ObjectLayers.AvatarHelper)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })

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
    }, [visible, debugEnabled, component.skeleton])

    return null
  }
})

const _vector = /*@__PURE__*/ new Vector3()
const _boneMatrix = /*@__PURE__*/ new Matrix4()
const _matrixWorldInv = /*@__PURE__*/ new Matrix4()
