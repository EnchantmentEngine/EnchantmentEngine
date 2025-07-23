import {
  createEntity,
  entityExists,
  EntityTreeComponent,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { useGLTFComponent } from '@ir-engine/engine/src/assets/functions/useGLTFComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/SpatialModule'
import { ComputedTransformComponent } from '@ir-engine/spatial/src/transform/components/ComputedTransformComponent'
import { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from 'three'

const GLTF_PATH = '/static/editor/spawn-point.glb'

export const SpawnPointHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props
  const debugEnabled = selected || hovered

  const debugGLTF = useGLTFComponent(debugEnabled ? GLTF_PATH : '', parentEntity)

  useEffect(() => {
    if (!debugGLTF || !debugEnabled) return

    const boundsHelperEntity = createEntity()
    setComponent(boundsHelperEntity, TransformComponent)
    setComponent(boundsHelperEntity, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(boundsHelperEntity, VisibleComponent)
    const buffer = new BufferGeometry()
    const positions = new Float32Array([-0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5])
    const indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0])
    buffer.setIndex(new BufferAttribute(indices, 1))
    buffer.setAttribute('position', new BufferAttribute(positions, 3))
    setComponent(
      boundsHelperEntity,
      ObjectComponent,
      new LineSegments(buffer, new LineBasicMaterial({ color: 'white' }))
    )

    setVisibleComponent(debugGLTF, true)
    setComponent(debugGLTF, ComputedTransformComponent, {
      referenceEntities: [parentEntity],
      computeFunction: () => {
        const scale = getComponent(parentEntity, TransformComponent).scale
        getComponent(debugGLTF, TransformComponent).scale.set(1 / scale.x, 1 / scale.y, 1 / scale.z)
      }
    })

    return () => {
      removeEntity(boundsHelperEntity)
      if (entityExists(debugGLTF)) setVisibleComponent(debugGLTF, false)
    }
  }, [debugGLTF, debugEnabled])

  return null
}
