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
