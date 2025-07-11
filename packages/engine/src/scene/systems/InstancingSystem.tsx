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
import { addOBCPlugin, removeOBCPlugin } from '@ir-engine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { DistanceFromCameraComponent } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import React, { useEffect } from 'react'
import { InstancedMesh, Material } from 'three'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { InstancingComponent } from '../components/InstancingComponent'
import { Heuristic, VariantComponent } from '../components/VariantComponent'
import { useEntity } from '../functions/useEntity'

export const InstancingSystem = defineSystem({
  uuid: 'ee.engine.InstancingSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const entities = useQuery([InstancingComponent, VariantComponent])

    return (
      <>
        {entities.map((entity) => (
          <InstanceEntityReactor entity={entity} key={entity} />
        ))}
      </>
    )
  }
})

const InstanceEntityReactor = ({ entity }: { entity: Entity }) => {
  const instancingComponent = useComponent(entity, InstancingComponent)
  const variantComponent = useComponent(entity, VariantComponent)

  if (!instancingComponent.auto.value) return null

  const variants = variantComponent.levels.value.map((level, index) => ({
    entity,
    index,
    key: stringHash(`${entity}-${index}-${level.src}`)
  }))

  return (
    <>
      {variants.map(({ entity, index, key }) => (
        <InstanceGenerator generator={entity} index={index} key={key} />
      ))}
    </>
  )
}

interface InstanceGeneratorProps {
  generator: Entity
  index: number
}

export const InstanceGenerator = ({ generator, index }: InstanceGeneratorProps) => {
  const { src } = useComponent(generator, VariantComponent).levels[index].value

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
        <InstancedMeshReactor entity={entity} generator={generator} key={entity} index={index} />
      ))}
    </>
  )
}

interface InstancedMeshReactorProps {
  entity: Entity
  generator: Entity
  index: number
}

const InstancedMeshReactor = ({ entity, generator, index }: InstancedMeshReactorProps) => {
  const { instanceMatrix } = useComponent(generator, InstancingComponent).value
  const mesh = useComponent(entity, MeshComponent).value as InstancedMesh
  const { heuristic } = useComponent(generator, VariantComponent).value

  const generateInstancedMesh = () => {
    const instancedMesh = new InstancedMesh(mesh.geometry.clone(), mesh.material as Material, instanceMatrix.count)
    instancedMesh.count = instanceMatrix.count
    instancedMesh.instanceMatrix.copy(instanceMatrix as any)
    instancedMesh.frustumCulled = false

    removeComponent(entity, MeshComponent)
    setComponent(entity, MeshComponent, instancedMesh)
    return instancedMesh
  }

  useEffect(() => {
    generateInstancedMesh()
  }, [instanceMatrix])

  switch (heuristic) {
    case Heuristic.DISTANCE:
      return <DistanceReactor entity={entity} generator={generator} index={index} />
    default:
      return null
  }
}

const DistanceReactor = ({ entity, generator, index }) => {
  const mesh = useComponent(entity, MeshComponent).value as InstancedMesh
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  const { minDistance, maxDistance } = useComponent(generator, VariantComponent).levels[index].metadata.value as {
    minDistance: number
    maxDistance: number
  }

  useEffect(() => {
    const plugin = {
      id: 'lod-culling',
      priority: 1,
      compile: (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          'uniform float opacity;',
          `uniform float opacity;
uniform float maxDistance;
uniform float minDistance;`
        )

        // Calculate the camera distance from the geometry
        // Discard fragments outside the minDistance and maxDistance range
        shader.fragmentShader = shader.fragmentShader.replace(
          'void main() {',
          `void main() {
float cameraDistance = length(vViewPosition);
if (cameraDistance <= minDistance || cameraDistance >= maxDistance) {
  discard;
}`
        )
        shader.uniforms.minDistance = { value: minDistance }
        shader.uniforms.maxDistance = { value: maxDistance }
      }
    }

    for (const material of materials) {
      addOBCPlugin(material, plugin)
    }

    setComponent(generator, DistanceFromCameraComponent)
    VariantComponent.setDistanceLevel(generator)

    return () => {
      for (const material of materials) {
        removeOBCPlugin(material, plugin)
      }
      removeComponent(generator, DistanceFromCameraComponent)
    }
  }, [])

  useEffect(() => {
    for (const material of materials) {
      if (!material.shader?.uniforms?.minDistance) continue
      material.shader.uniforms.minDistance.value = minDistance
      material.shader.uniforms.maxDistance.value = maxDistance
    }
  }, [minDistance, maxDistance])

  return null
}
