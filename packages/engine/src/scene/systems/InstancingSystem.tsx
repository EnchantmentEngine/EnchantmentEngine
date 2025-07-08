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
  setComponent,
  useComponent,
  useOptionalComponent,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import React, { useEffect } from 'react'
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
    useEffect(() => {
      console.log('reactor inited')
    }, [])

    return (
      <>
        {entities.flatMap((entity) => (
          <VarianceReactor entity={entity} key={entity} />
        ))}
      </>
    )
  }
})

export const VarianceReactor = ({ entity }: { entity: Entity }) => {
  const variantComponent = useComponent(entity, VariantComponent)
  const levels = variantComponent.levels.value
  console.log(levels)
  useEffect(() => {
    console.log('variant reactor inited')
  }, [])
  // return <></>
  return (
    <>
      {levels.map((level, index) => (
        <InstancingReactor entity={entity} level={level} index={index} key={index} />
      ))}
    </>
  )
}

export const InstancingReactor = (props: { level: Level; entity: Entity; index: number }) => {
  const { level, entity: parentEntity, index } = props
  const { src, metadata } = level
  const minDistance = metadata['minDistance']
  const maxDistance = metadata['maxDistance']
  const pathname = new URL(src).pathname.split('/').at(-1)

  const childEntity = useEntity({
    setup(entity) {
      console.log('setting up ', entity)
      setComponent(entity, UUIDComponent, {
        entitySourceID: getComponent(parentEntity, UUIDComponent).entitySourceID,
        entityID: 'LOD-' + index
      } as EntityUUIDPair)
      setComponent(entity, NameComponent, getComponent(parentEntity, NameComponent) + ' LOD ' + index)
      setComponent(entity, TransformComponent)
      setComponent(entity, EntityTreeComponent, { parentEntity })
      setComponent(entity, VisibleComponent)
      setComponent(entity, GLTFComponent, { src })
      console.log('setup', entity)
    }
  })

  useEffect(() => {
    console.log('instancing reactor inited ', childEntity)
  }, [])

  const mesh = useOptionalComponent(childEntity, MeshComponent)?.value

  useEffect(() => {
    if (!mesh) return
    console.log('mesh', mesh, childEntity)
  }, [mesh])

  // const mesh = useComponent(childEntity, MeshComponent).value
  // const { heuristic } = useComponent(parentEntity, VariantComponent).value
  // const { instanceMatrix } = useComponent(parentEntity, InstancingComponent).value

  // useEffect(() => {
  //   console.log(mesh)
  // }, [mesh])

  return <></>

  const setup = (entity: Entity) => {
    console.log('setting up ', entity)
    setComponent(entity, UUIDComponent, {
      entitySourceID: getComponent(parentEntity, UUIDComponent).entitySourceID,
      entityID: 'LOD-' + props.level
    } as EntityUUIDPair)
    setComponent(entity, NameComponent, getComponent(parentEntity, NameComponent) + ' LOD ' + index)
    setComponent(entity, TransformComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity })
    setComponent(entity, VisibleComponent)
    setComponent(entity, GLTFComponent, { src: level.src })
    console.log('setup', entity)
  }

  const entity = useEntity({ setup })

  // const mesh = useComponent(entity, MeshComponent).value
  const { heuristic } = useComponent(parentEntity, VariantComponent).value
  const { instanceMatrix } = useComponent(parentEntity, InstancingComponent).value

  // console.log(entity)
  // useEffect(() => {
  //   console.log('mounting', entity)
  // },[entity])

  //   useEffect(() => {
  //     if (!mesh) return
  //     console.log('mesh', mesh, entity)

  //     const instancedMesh =
  //       mesh instanceof InstancedMesh
  //         ? mesh
  //         : new InstancedMesh(mesh.geometry.clone(), mesh.material as Material | Material[], instanceMatrix.count)
  //     instancedMesh.instanceMatrix.copy(instanceMatrix as InstancedBufferAttribute)
  //     instancedMesh.frustumCulled = false

  //     const materials = Array.isArray(instancedMesh.material) ? instancedMesh.material : [instancedMesh.material]
  //     for (const material of materials) {
  //       if (!material.shader?.uniforms?.minDistance) continue
  //       material.shader.uniforms.minDistance.value = metadata['minDistance']
  //       material.shader.uniforms.maxDistance.value = metadata['maxDistance']
  //     }

  //     if (heuristic === Heuristic.DISTANCE) {
  //       for (const material of materials) {
  //         addOBCPlugin(material, {
  //           id: 'lod-culling',
  //           priority: 1,
  //           compile: (shader, renderer) => {
  //             shader.fragmentShader = shader.fragmentShader.replace(
  //               'uniform float opacity;',
  //               `uniform float opacity;
  // uniform float maxDistance;
  // uniform float minDistance;`
  //             )

  //             // Calculate the camera distance from the geometry
  //             // Discard fragments outside the minDistance and maxDistance range
  //             shader.fragmentShader = shader.fragmentShader.replace(
  //               'void main() {',
  //               `void main() {
  //   float cameraDistance = length(vViewPosition);
  //   if (cameraDistance <= minDistance || cameraDistance >= maxDistance) {
  //     discard;
  //   }`
  //             )
  //             material.shader.uniforms.minDistance = { value: minDistance }
  //             material.shader.uniforms.maxDistance = { value: maxDistance }
  //           }
  //         })
  //       }
  //     }

  //     removeComponent(entity, MeshComponent)
  //     setComponent(entity, MeshComponent, instancedMesh)
  //   }, [mesh])

  return <></>
}
