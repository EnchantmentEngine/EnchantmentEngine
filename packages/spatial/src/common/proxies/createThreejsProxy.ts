import { Quaternion, Vector3 } from 'three'

import { Entity } from '@ir-engine/ecs/src/Entity'

const { defineProperties } = Object

type Vector3Proxy = { x: number; y: number; z: number }
type QuaternionProxy = { x: number; y: number; z: number; w: number }

type Vector3Store = { x: Float64Array; y: Float64Array; z: Float64Array }
type QuaternionStore = { x: Float64Array; y: Float64Array; z: Float64Array; w: Float64Array }

export interface ProxyExtensions {
  entity: number
  store: Vector3Proxy | QuaternionProxy
}

export const proxifyVector3 = (
  store: Vector3Store,
  entity: Entity,
  vector3 = new Vector3()
): Vector3 & ProxyExtensions => {
  // Set the initial values
  store.x[entity] = vector3.x
  store.y[entity] = vector3.y
  store.z[entity] = vector3.z
  return defineProperties(vector3 as Vector3 & ProxyExtensions, {
    entity: { value: entity, configurable: true, writable: true },
    store: { value: store, configurable: true, writable: true },
    dirtyRecord: { value: {}, configurable: true, writable: true },
    x: {
      get() {
        return store.x[entity]
      },
      set(n) {
        return (store.x[entity] = n)
      },
      configurable: true
    },
    y: {
      get() {
        return store.y[entity]
      },
      set(n) {
        return (store.y[entity] = n)
      },
      configurable: true
    },
    z: {
      get() {
        return store.z[entity]
      },
      set(n) {
        return (store.z[entity] = n)
      },
      configurable: true
    }
  })
}

export const proxifyVector3WithDirty = (
  store: Vector3Store,
  entity: Entity,
  dirty: Uint8Array,
  vector3 = new Vector3()
): Vector3 & ProxyExtensions => {
  // Set the initial values
  store.x[entity] = vector3.x
  store.y[entity] = vector3.y
  store.z[entity] = vector3.z
  dirty[entity] = 1
  return defineProperties(vector3 as Vector3 & ProxyExtensions, {
    entity: { value: entity, configurable: true, writable: true },
    store: { value: store, configurable: true, writable: true },
    dirtyRecord: { value: dirty, configurable: true, writable: true },
    x: {
      get() {
        return store.x[entity]
      },
      set(n) {
        dirty[entity] = 1
        return (store.x[entity] = n)
      },
      configurable: true
    },
    y: {
      get() {
        return store.y[entity]
      },
      set(n) {
        dirty[entity] = 1
        return (store.y[entity] = n)
      },
      configurable: true
    },
    z: {
      get() {
        return store.z[entity]
      },
      set(n) {
        dirty[entity] = 1
        return (store.z[entity] = n)
      },
      configurable: true
    }
  })
}

export const proxifyQuaternion = (
  store: QuaternionStore,
  entity: Entity,
  quaternion = new Quaternion()
): Quaternion & ProxyExtensions => {
  // Set the initial values
  store.x[entity] = quaternion.x
  store.y[entity] = quaternion.y
  store.z[entity] = quaternion.z
  store.w[entity] = quaternion.w
  return defineProperties(quaternion as Quaternion & ProxyExtensions, {
    entity: { value: entity, configurable: true, writable: true },
    store: { value: store, configurable: true, writable: true },
    dirtyRecord: { value: {}, configurable: true, writable: true },
    _x: {
      get() {
        return store.x[entity]
      },
      set(n) {
        return (store.x[entity] = n)
      },
      configurable: true
    },
    _y: {
      get() {
        return store.y[entity]
      },
      set(n) {
        return (store.y[entity] = n)
      },
      configurable: true
    },
    _z: {
      get() {
        return store.z[entity]
      },
      set(n) {
        return (store.z[entity] = n)
      },
      configurable: true
    },
    _w: {
      get() {
        return store.w[entity]
      },
      set(n) {
        return (store.w[entity] = n)
      },
      configurable: true
    },
    x: {
      get() {
        return store.x[entity]
      },
      set(n) {
        return (store.x[entity] = n)
      },
      configurable: true
    },
    y: {
      get() {
        return store.y[entity]
      },
      set(n) {
        return (store.y[entity] = n)
      },
      configurable: true
    },
    z: {
      get() {
        return store.z[entity]
      },
      set(n) {
        return (store.z[entity] = n)
      },
      configurable: true
    },
    w: {
      get() {
        return store.w[entity]
      },
      set(n) {
        return (store.w[entity] = n)
      },
      configurable: true
    }
  })
}

export const proxifyQuaternionWithDirty = (
  store: QuaternionStore,
  entity: Entity,
  dirty: Uint8Array,
  quaternion = new Quaternion()
): Quaternion & ProxyExtensions => {
  // Set the initial values
  store.x[entity] = quaternion.x
  store.y[entity] = quaternion.y
  store.z[entity] = quaternion.z
  store.w[entity] = quaternion.w
  dirty[entity] = 1
  return defineProperties(quaternion as Quaternion & ProxyExtensions, {
    entity: { value: entity, configurable: true, writable: true },
    store: { value: store, configurable: true, writable: true },
    dirtyRecord: { value: dirty, configurable: true, writable: true },
    _x: {
      get() {
        return store.x[entity]
      },
      set(n) {
        dirty[entity] = 1
        return (store.x[entity] = n)
      },
      configurable: true
    },
    _y: {
      get() {
        return store.y[entity]
      },
      set(n) {
        dirty[entity] = 1
        return (store.y[entity] = n)
      },
      configurable: true
    },
    _z: {
      get() {
        return store.z[entity]
      },
      set(n) {
        dirty[entity] = 1
        return (store.z[entity] = n)
      },
      configurable: true
    },
    _w: {
      get() {
        return store.w[entity]
      },
      set(n) {
        dirty[entity] = 1
        return (store.w[entity] = n)
      },
      configurable: true
    },
    x: {
      get() {
        return store.x[entity]
      },
      set(n) {
        dirty[entity] = 1
        return (store.x[entity] = n)
      },
      configurable: true
    },
    y: {
      get() {
        return store.y[entity]
      },
      set(n) {
        dirty[entity] = 1
        return (store.y[entity] = n)
      },
      configurable: true
    },
    z: {
      get() {
        return store.z[entity]
      },
      set(n) {
        dirty[entity] = 1
        return (store.z[entity] = n)
      },
      configurable: true
    },
    w: {
      get() {
        return store.w[entity]
      },
      set(n) {
        dirty[entity] = 1
        return (store.w[entity] = n)
      },
      configurable: true
    }
  })
}
