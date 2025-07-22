import { createResizableTypeArray } from '@ir-engine/ecs/src/bitecsLegacy'
import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

export const DistanceFromLocalClientComponent = defineComponent({
  name: 'DistanceFromLocalClientComponent',
  storage: {
    squaredDistance: createResizableTypeArray(Float32Array)
  }
})
export const DistanceFromCameraComponent = defineComponent({
  name: 'DistanceFromCameraComponent',
  storage: {
    squaredDistance: createResizableTypeArray(Float32Array)
  }
})

export const FrustumCullCameraComponent = defineComponent({
  name: 'FrustumCullCameraComponent',

  storage: {
    isCulled: createResizableTypeArray(Uint8Array)
  },

  onRemove(entity, component) {
    FrustumCullCameraComponent.isCulled[entity] = 0
  }
})

export const compareDistanceToCamera = (a: Entity, b: Entity) => {
  const aDist = DistanceFromCameraComponent.squaredDistance[a]
  const bDist = DistanceFromCameraComponent.squaredDistance[b]
  return aDist - bDist
}

export const compareDistanceToLocalClient = (a: Entity, b: Entity) => {
  const aDist = DistanceFromLocalClientComponent.squaredDistance[a]
  const bDist = DistanceFromLocalClientComponent.squaredDistance[b]
  return aDist - bDist
}
