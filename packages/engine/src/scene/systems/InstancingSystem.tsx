/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  defineSystem,
  Entity,
  EntityTreeComponent,
  EntityUUIDPair,
  getComponent,
  PresentationSystemGroup,
  removeComponent,
  setComponent,
  useComponent,
  useQuery,
  useQueryBySource,
  UUIDComponent
} from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import React, { useEffect } from 'react'
import { InstancedBufferAttribute, InstancedMesh, Material } from 'three'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { InstancingComponent } from '../components/InstancingComponent'
import { VariantComponent } from '../components/VariantComponent'
import { useEntity } from '../functions/useEntity'

interface Level {
  src: string
  metadata: Record<string, any>
}

export const InstancingSystem = defineSystem({
  uuid: 'ee.engine.InstancingSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const entities = useQuery([InstancingComponent, VariantComponent])

    const generators = entities.flatMap((entity) => {
      const variantComponent = getComponent(entity, VariantComponent)
      return variantComponent.levels.map((level, index) => ({
        entity,
        index
      }))
    })

    return (
      <>
        {generators.map(({ entity, index }) => (
          <InstanceGenerator entity={entity} index={index} key={`${entity}-${index}`} />
        ))}
      </>
    )
  }
})

interface InstanceGeneratorProps {
  entity: Entity
  index: number
}

export const InstanceGenerator = ({ entity: parentEntity, index }: InstanceGeneratorProps) => {
  const variantComponent = useComponent(parentEntity, VariantComponent)
  const level = variantComponent.levels[index].value
  const { src } = level

  const gltfEntity = useEntity({
    setup: (entity) => {
      setComponent(entity, UUIDComponent, {
        entitySourceID: getComponent(parentEntity, UUIDComponent).entitySourceID,
        entityID: 'LOD-' + index
      } as EntityUUIDPair)
      setComponent(entity, NameComponent, getComponent(parentEntity, NameComponent) + ' LOD ' + index)
      setComponent(entity, TransformComponent)
      setComponent(entity, EntityTreeComponent, { parentEntity })
      setComponent(entity, VisibleComponent)
      setComponent(entity, GLTFComponent, { src })
    },
    cleanup: (entity) => {
      const rigidBodies = useQueryBySource(entity, [RigidBodyComponent])
      for (const rigidBody of rigidBodies) {
        removeComponent(rigidBody, RigidBodyComponent)
      }
    }
  })

  const meshEntities = useQueryBySource(gltfEntity, [MeshComponent])

  return (
    <>
      {meshEntities.map((meshEntity) => (
        <InstancingReactor entity={parentEntity} meshEntity={meshEntity} level={level} index={index} />
      ))}
    </>
  )
}

export const InstancingReactor = (props: { level: Level; entity: Entity; index: number; meshEntity: Entity }) => {
  const { level, entity: parentEntity, index, meshEntity } = props
  const { metadata } = level
  const { instanceMatrix } = useComponent(parentEntity, InstancingComponent)
  const mesh = useComponent(meshEntity, MeshComponent).value
  const { count } = instanceMatrix
  const minDistance = metadata['minDistance']
  const maxDistance = metadata['maxDistance']
  const { heuristic } = useComponent(parentEntity, VariantComponent).value

  const refreshInstanceMesh = () => {
    const instancedMesh = new InstancedMesh(mesh.geometry.clone(), mesh.material as Material, count.value)
    instancedMesh.instanceMatrix.copy(instanceMatrix.value as InstancedBufferAttribute)
    instancedMesh.frustumCulled = false

    removeComponent(meshEntity, RigidBodyComponent)
    removeComponent(meshEntity, MeshComponent)
    setComponent(meshEntity, MeshComponent, instancedMesh)
  }

  useEffect(() => {
    const currentMesh = getComponent(meshEntity, MeshComponent)
    const isInstanceMesh = currentMesh instanceof InstancedMesh
    if (!isInstanceMesh) {
      refreshInstanceMesh()
      return
    }

    const currentCount = (currentMesh as InstancedMesh).instanceMatrix.count
    if (currentCount !== count.value) {
      refreshInstanceMesh()
    }
  }, [count, mesh, instanceMatrix])

  return null
}
