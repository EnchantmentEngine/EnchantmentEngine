import { createEntity, EntityTreeComponent, getComponent, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { DoubleSide, Mesh, MeshBasicMaterial, TorusGeometry } from 'three'

export function createLoadingSpinner(name = 'loading spinner', loadingEntity = UndefinedEntity) {
  const sphereEntity = createEntity()
  setComponent(sphereEntity, NameComponent, name + ': helper')
  setComponent(sphereEntity, VisibleComponent)
  setComponent(sphereEntity, TransformComponent, { position: getComponent(loadingEntity, TransformComponent).position })
  setComponent(sphereEntity, EntityTreeComponent, { parentEntity: getState(ReferenceSpaceState).originEntity })

  const sphereMesh = new Mesh(
    new TorusGeometry(1, 0.2, 16, 100, Math.PI * 1.5),
    new MeshBasicMaterial({ side: DoubleSide, depthTest: false, color: 0x0077ff })
  )
  setComponent(sphereEntity, MeshComponent, sphereMesh)

  return sphereEntity
}
