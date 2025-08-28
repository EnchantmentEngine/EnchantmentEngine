/*
 * Parts of this legacy module are based on MPL licensed code from
 * https://github.com/NateTheGreatt/bitECS, which as been adapted to support
 * resizeable typed arrays.
 */

import {
  ComponentRef,
  EntityId,
  QueryTerm,
  addComponent as ecsAddComponent,
  hasComponent as ecsHasComponent,
  removeComponent as ecsRemoveComponent,
  observe,
  onAdd,
  onRemove,
  query
} from 'bitecs'

export interface IWorld {}

export type Query<W extends IWorld = IWorld> = (world: W) => readonly EntityId[]

export function defineQuery(components: QueryTerm[]) {
  const queryFn = (world: IWorld) => query(world, components)
  queryFn.components = components
  return queryFn
}

export function enterQuery<W extends IWorld = IWorld>(queryFn: Query<W>): Query<W> & { unsubscribe: () => void } {
  const queue: number[] = []
  const initSet = new WeakSet<IWorld>()
  const query = (world: W) => {
    if (!initSet.has(world)) {
      initSet.add(world)
      queue.push(...queryFn(world))
      const unsub = observe(world, onAdd(...(queryFn as any).components), (eid: EntityId) => queue.push(eid))
      query.unsubscribe = () => {
        unsub()
        queue.length = 0
      }
    }
    if (queue.length) {
      const results = queue.slice()
      queue.length = 0
      return results
    } else {
      return queue
    }
  }
  query.unsubscribe = () => {}
  return query
}

export function exitQuery<W extends IWorld = IWorld>(queryFn: Query<W>): Query<W> & { unsubscribe: () => void } {
  const queue: number[] = []
  const initSet = new WeakSet<IWorld>()
  const query = (world: W) => {
    if (!initSet.has(world)) {
      initSet.add(world)
      const unsub = observe(world, onRemove(...(queryFn as any).components), (eid: EntityId) => queue.push(eid))
      query.unsubscribe = () => {
        unsub()
        queue.length = 0
      }
    }
    if (queue.length) {
      const results = queue.slice()
      queue.length = 0
      return results
    } else {
      return queue
    }
  }
  query.unsubscribe = () => {}
  return query
}

export const addComponent = (world: IWorld, component: ComponentRef, eid: EntityId) =>
  ecsAddComponent(world, eid, component)

export const hasComponent = (world: IWorld, component: ComponentRef, eid: EntityId) =>
  ecsHasComponent(world, eid, component)

export const removeComponent = (world: IWorld, component: ComponentRef, eid: EntityId) =>
  ecsRemoveComponent(world, eid, component)

export type TypedArray =
  | Uint8Array
  | Int8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array

export type TypedArrayConstructor =
  | Uint8ArrayConstructor
  | Int8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Int16ArrayConstructor
  | Uint16ArrayConstructor
  | Int32ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor

export function createResizableTypeArray<T extends TypedArrayConstructor>(TypeConstructor: T) {
  // @ts-ignore - maxByteLength not included in TS definitions
  const buffer = new ArrayBuffer(0, { maxByteLength: Math.pow(2, 20) })
  return new TypeConstructor(buffer) as InstanceType<T>
}

export type ResizableArray = ReturnType<typeof createResizableTypeArray>
