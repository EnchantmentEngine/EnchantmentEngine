
import { useEffect } from 'react'
import { Mesh, Object3D } from 'three'

import {
  createEntity,
  Entity,
  EntityTreeComponent,
  getComponent,
  getOptionalComponent,
  removeComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useOptionalComponent
} from '@ir-engine/ecs'
import { useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { InputComponent } from '../../input/components/InputComponent'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { HelperComponent } from '../HelperComponent'

type DisposableObject3D = Object3D & { update?: () => void; dispose?: () => void }

export function useHelperEntity<TObject extends DisposableObject3D>(
  parentEntity: Entity,
  helperFactory: () => TObject,
  enabled: boolean,
  layerMask = ObjectLayerMasks.NodeHelper,
  nameSuffix = 'helper'
): Entity {
  const helperEntityState = useHookstate(UndefinedEntity)
  const nameComponent = useOptionalComponent(parentEntity, NameComponent)
  const transform = useOptionalComponent(helperEntityState.value, TransformComponent)

  useEffect(() => {
    if (!enabled) return

    const helperEntity = createHelperEntity(parentEntity, helperFactory, layerMask)
    const helper = getComponent(helperEntity, ObjectComponent) as TObject
    const helperMesh = helper.children[0] as Mesh<any, any> | undefined
    helperEntityState.set(helperEntity)
    setComponent(parentEntity, HelperComponent)
    if (typeof helper.update === 'function') helper.update()
    return () => {
      if (helperMesh) {
        helperMesh.material.dispose()
        helperMesh.geometry.dispose()
      } else if (helper.dispose) helper.dispose()

      removeComponent(parentEntity, HelperComponent)
      helperEntityState.set(UndefinedEntity)
      removeEntity(helperEntity)
    }
  }, [enabled])

  useEffect(() => {
    if (!helperEntityState.value) return
    setComponent(helperEntityState.value, NameComponent, `${nameComponent?.value ?? parentEntity}-${nameSuffix}`)
  }, [helperEntityState.value, nameComponent, enabled])

  useEffect(() => {
    if (!helperEntityState.value || !transform) return
    const helper = getOptionalComponent(helperEntityState.value, ObjectComponent) as TObject
    if (!helper) return
    if (typeof helper.update === 'function') helper.update()
  }, [transform, helperEntityState.value, enabled])

  return helperEntityState.value
}

export function createHelperEntity<TObject extends DisposableObject3D>(
  parentEntity: Entity,
  helperFactory: () => TObject,
  layerMask = ObjectLayerMasks.NodeHelper,
  nameSuffix = '-helper'
): Entity {
  const helperEntity = createEntity()
  const name = getComponent(parentEntity, NameComponent)
  const helper = helperFactory()
  helper.preserveChildren = true

  setComponent(helperEntity, EntityTreeComponent, { parentEntity: parentEntity })
  setComponent(helperEntity, TransformComponent)
  setComponent(helperEntity, ObjectComponent, helper)
  setComponent(helperEntity, ObjectLayerMaskComponent, layerMask)
  setComponent(helperEntity, VisibleComponent, true)

  setComponent(helperEntity, NameComponent, `${name ?? parentEntity}-${nameSuffix}`)
  setComponent(helperEntity, InputComponent, { grow: true })
  return helperEntity
}
