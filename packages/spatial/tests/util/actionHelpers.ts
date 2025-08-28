import { HyperFlux } from '@ir-engine/hyperflux'

/**
 * @description Returns the first incoming action that matches the `@param name` from the Hyperflux store's incoming actions
 * */
export function getIncomingAction(name: string) {
  for (const action of HyperFlux.store.actions.incoming) {
    if (action.type === name) return action
  }
  return undefined
}

/**
 * @description Returns the last action from the Hyperflux store's actions history
 * */
export function getLastAction() {
  return HyperFlux.store.actions.history.at(-1)
}
