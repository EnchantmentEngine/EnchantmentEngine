
import { Object3D } from 'three'

import { Entity, entityExists } from '@ir-engine/ecs'
import { defineComponent, hasComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createResizableTypeArray } from '@ir-engine/ecs/src/bitecsLegacy'
import { ObjectLayer, ObjectLayerMask, ObjectLayerMasks } from '../constants/ObjectLayers'

const maxBitWidth = 32
/**
 * @note - do not use ObjectLayerComponent directly, use ObjectLayerMaskComponent instead
 */
export const ObjectLayerComponents = Array.from({ length: maxBitWidth }, (_, i) => {
  return defineComponent({
    name: `ObjectLayer${i}`
  })
})

export const ObjectLayerMaskDefault = 1 << 0 // enable layer 0

export const ObjectLayerMaskComponent = defineComponent({
  name: 'ObjectLayerMaskComponent',

  storage: {
    mask: createResizableTypeArray(Int32Array)
  },

  /**
   * @description
   * Takes a layer mask as a parameter, not a layer (eg. layer mask with value 256 enables layer 8)
   * ```ts
   * // Incorrect usage
   * setComponent(entity, ObjectLayerMaskComponent, ObjectLayers.NodeHelper)
   *
   * // Correct usage
   * setComponent(entity, ObjectLayerMaskComponent, ObjectLayerMasks.NodeHelper)
   * ```
   */
  onSet(entity, component, mask = ObjectLayerMaskDefault) {
    for (let i = 0; i < maxBitWidth; i++) {
      const isSet = (mask & ((1 << i) | 0)) !== 0
      if (isSet) {
        setComponent(entity, ObjectLayerComponents[i])
      } else {
        removeComponent(entity, ObjectLayerComponents[i])
      }
    }
    ObjectLayerMaskComponent.mask[entity] = mask
  },

  onRemove(entity, component) {
    for (let i = 0; i < maxBitWidth; i++) {
      removeComponent(entity, ObjectLayerComponents[i])
    }
  },

  setLayer(entity: Entity, layer: number) {
    const mask = ((1 << layer) | 0) >>> 0
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  enableLayer(entity: Entity, layer: number) {
    if (!entityExists(entity)) return
    if (!hasComponent(entity, ObjectLayerMaskComponent)) setComponent(entity, ObjectLayerMaskComponent)
    const currentMask = ObjectLayerMaskComponent.mask[entity]
    const mask = currentMask | ((1 << layer) | 0)
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  enableLayers(entity: Entity, ...layers: number[]) {
    if (!hasComponent(entity, ObjectLayerMaskComponent)) setComponent(entity, ObjectLayerMaskComponent)
    const currentMask = ObjectLayerMaskComponent.mask[entity]
    let mask = currentMask
    for (const layer of layers) {
      mask |= (1 << layer) | 0
    }
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  disableLayer(entity: Entity, layer: number) {
    if (!entityExists(entity)) return
    if (!hasComponent(entity, ObjectLayerMaskComponent)) setComponent(entity, ObjectLayerMaskComponent)
    const currentMask = ObjectLayerMaskComponent.mask[entity]
    const mask = currentMask & ~((1 << layer) | 0)
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  disableLayers(entity: Entity, ...layers: number[]) {
    if (!hasComponent(entity, ObjectLayerMaskComponent)) setComponent(entity, ObjectLayerMaskComponent)
    const currentMask = ObjectLayerMaskComponent.mask[entity]
    let mask = currentMask
    for (const layer of layers) {
      mask &= ~((1 << layer) | 0)
    }
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  toggleLayer(entity: Entity, layer: ObjectLayer) {
    if (!hasComponent(entity, ObjectLayerMaskComponent)) setComponent(entity, ObjectLayerMaskComponent)
    const currentMask = ObjectLayerMaskComponent.mask[entity]
    const mask = currentMask ^ ((1 << layer) | 0)
    setComponent(entity, ObjectLayerMaskComponent, mask)
  },

  setMask(entity: Entity, mask: ObjectLayerMask) {
    setComponent(entity, ObjectLayerMaskComponent, mask)
  }
})

export class Layer {
  entity: Entity

  constructor(entity: Entity) {
    this.entity = entity
    if (!hasComponent(entity, ObjectLayerMaskComponent)) setComponent(entity, ObjectLayerMaskComponent)
  }

  get mask() {
    return ObjectLayerMaskComponent.mask[this.entity]
  }

  set mask(val) {
    setComponent(this.entity, ObjectLayerMaskComponent, val)
  }

  set(channel: number) {
    ObjectLayerMaskComponent.setLayer(this.entity, channel)
  }

  enable(channel: number) {
    ObjectLayerMaskComponent.enableLayer(this.entity, channel)
  }

  enableAll() {
    ObjectLayerMaskComponent.setMask(this.entity, -1 as ObjectLayerMask)
  }

  toggle(channel: ObjectLayer) {
    ObjectLayerMaskComponent.toggleLayer(this.entity, channel)
  }

  disable(channel: number) {
    ObjectLayerMaskComponent.disableLayer(this.entity, channel)
  }

  disableAll() {
    ObjectLayerMaskComponent.setMask(this.entity, 0 as ObjectLayerMask)
  }

  test(layers: Layer) {
    return (this.mask & layers.mask) !== 0
  }

  isEnabled(channel: ObjectLayer) {
    return (this.mask & ((1 << channel) | 0)) !== 0
  }
}

/**
 * @deprecated use ObjectLayerMaskComponent instead
 */
export function setObjectLayers(object: Object3D, ...layers: number[]) {
  object.traverse((obj: Object3D) => {
    if (obj.entity) ObjectLayerMaskComponent.setMask(obj.entity, ObjectLayerMasks.Scene)
    obj.layers.disableAll()
    for (const layer of layers) {
      if (obj.entity) ObjectLayerMaskComponent.enableLayer(obj.entity, layers[0])
      obj.layers.enable(layer)
    }
  })
}
