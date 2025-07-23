import { Engine } from '@ir-engine/ecs'

/**
 * @description Returns the first incoming action that matches the `@param name` from the Engine.instance's actions store
 * */
export function getIncomingAction(name: string) {
  for (const action of Engine.instance.store.actions.incoming) {
    if (action.type === name) return action
  }
  return undefined
}

/**
 * @description Returns the last action from the Engine.instance's actions history
 * */
export function getLastAction() {
  return Engine.instance.store.actions.history.at(-1)
}
