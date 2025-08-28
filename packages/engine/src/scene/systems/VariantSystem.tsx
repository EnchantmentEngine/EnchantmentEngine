import { Not } from '@ir-engine/ecs'

import { PresentationSystemGroup } from '@ir-engine/ecs'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getState } from '@ir-engine/hyperflux'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { DistanceFromCameraComponent } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { InstancingComponent } from '../components/InstancingComponent'
import { VariantComponent } from '../components/VariantComponent'

const updateFrequency = 0.1
let lastUpdate = 0

export const distanceVariantQuery = defineQuery([VariantComponent, TransformComponent, DistanceFromCameraComponent])
export const meshVariantQuery = defineQuery([
  VariantComponent,
  MeshComponent,
  TransformComponent,
  Not(InstancingComponent)
])
export const instancedMeshVariantQuery = defineQuery([
  VariantComponent,
  MeshComponent,
  TransformComponent,
  InstancingComponent
])

function execute() {
  const ecsState = getState(ECSState)

  if (ecsState.elapsedSeconds - lastUpdate < updateFrequency) return
  lastUpdate = ecsState.elapsedSeconds

  for (const entity of distanceVariantQuery()) {
    VariantComponent.setDistanceLevel(entity)
  }
}

export const VariantSystem = defineSystem({
  uuid: 'ee.engine.scene.VariantSystem',
  insert: { after: PresentationSystemGroup },
  execute
})
