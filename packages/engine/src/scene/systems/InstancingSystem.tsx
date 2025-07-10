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
import { stringHash } from '@ir-engine/spatial/src/common/functions/MathFunctions'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import React, { useEffect } from 'react'
import { InstancedMesh, Material } from 'three'
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
    const entities = useQuery([InstancingComponent, VariantComponent]).filter(
      (e) => getComponent(e, InstancingComponent).auto
    )

    return (
      <>
        {entities.map((entity) => (
          <LODVariantReactor entity={entity} key={entity} />
        ))}
      </>
    )
  }
})

const LODVariantReactor = ({ entity }) => {
  const levels = useComponent(entity, VariantComponent).levels.value.filter((level) => !!level.src)

  const getHash = (level: Level, index: number) => {
    return stringHash(level.src + entity.toString() + index.toString())
  }

  return (
    <>
      {levels.map((level, index) => (
        <InstanceGenerator generator={entity} level={level} index={index} key={getHash(level, index)} />
      ))}
    </>
  )
}

interface InstanceGeneratorProps {
  generator: Entity
  level: Level
  index: number
}

export const InstanceGenerator = ({ generator, index, level }: InstanceGeneratorProps) => {
  const { src } = level

  const setup = (entity: Entity) => {
    const entitySourceID = getComponent(generator, UUIDComponent).entitySourceID
    const entityID = UUIDComponent.generate()
    setComponent(entity, UUIDComponent, {
      entitySourceID,
      entityID
    } as EntityUUIDPair)
    setComponent(entity, NameComponent, getComponent(generator, NameComponent) + ' LOD ' + index)
    setComponent(entity, TransformComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity: generator })
    setComponent(entity, VisibleComponent)
    setComponent(entity, GLTFComponent, { src })
  }

  const gltfEntity = useEntity({ setup })
  const meshEntities = useQueryBySource(gltfEntity, [MeshComponent])

  return (
    <>
      {meshEntities.map((entity) => (
        <InstancedMeshReactor entity={entity} generator={generator} key={entity} />
      ))}
    </>
  )
}

interface InstancedMeshReactorProps {
  entity: Entity
  generator: Entity
}

const InstancedMeshReactor = ({ entity, generator }: InstancedMeshReactorProps) => {
  const { instanceMatrix } = useComponent(generator, InstancingComponent).value

  const generateInstancedMesh = () => {
    const mesh = getComponent(entity, MeshComponent) as InstancedMesh
    const instancedMesh = new InstancedMesh(mesh.geometry.clone(), mesh.material as Material, instanceMatrix.count)
    instancedMesh.count = instanceMatrix.count
    instancedMesh.instanceMatrix.copy(instanceMatrix as any)
    instancedMesh.frustumCulled = false

    if (!mesh.isInstancedMesh) {
      removeComponent(entity, RigidBodyComponent)
      removeComponent(entity, MeshComponent)
    }

    setComponent(entity, MeshComponent, instancedMesh as InstancedMesh)
  }

  useEffect(() => {
    generateInstancedMesh()
  }, [instanceMatrix])

  return null
}
