import { defineComponent, getComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

export const StandardCallbacks = {
  PLAY: 'xre.play',
  PAUSE: 'xre.pause',
  STOP: 'xre.stop',
  RESET: 'xre.reset'
} as const

export type StandardCallbacksType = (typeof StandardCallbacks)[keyof typeof StandardCallbacks]

export const CallbackComponent = defineComponent({
  name: 'CallbackComponent',
  onInit: () => new Map<string, (...params: any) => void>()
})

export function setCallback(entity: Entity, key: string, callback: (...params: any) => void) {
  if (!hasComponent(entity, CallbackComponent)) setComponent(entity, CallbackComponent, new Map())
  const callbacks = getComponent(entity, CallbackComponent)
  callbacks.set(key, callback)
  callbacks[key] = key // for inspector
}

export function removeCallback(entity: Entity, key: string) {
  if (!hasComponent(entity, CallbackComponent)) return
  const callbacks = getComponent(entity, CallbackComponent)
  callbacks.delete(key)
  callbacks[key] = undefined // for inspector
}

export function getCallback(entity: Entity, key: string): ((...params: any) => void) | undefined {
  if (!hasComponent(entity, CallbackComponent)) return undefined
  return getComponent(entity, CallbackComponent).get(key)
}

export function hasCallback(entity: Entity, key: string): boolean {
  if (!hasComponent(entity, CallbackComponent)) return false
  return !!getComponent(entity, CallbackComponent).get(key)
}
