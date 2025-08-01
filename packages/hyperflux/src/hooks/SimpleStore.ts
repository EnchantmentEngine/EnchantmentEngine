import React, { useEffect, useMemo, useState } from 'react'
import { DeepReadonly } from '../types/DeepReadonly'

// tslint:disable:ordered-imports
import type from 'react/experimental'

type Listener = () => void

const _callListener = (listener: Listener) => listener()

const isPromise = (value: any): value is Promise<any> => {
  return value && typeof value.then === 'function'
}
/**
 * Creates a simple store that can hold a value or a promise.
 * The store can be used to manage state in a React application.
 * @param initialValue The initial value of the store, can be a value or a promise.
 * @param identifier An optional identifier for the store.
 * @returns A store object with methods to get and set the value, and subscribe to changes.
 */
export function createSimpleStore<T>(initialValue: T | Promise<T>, identifier?: string) {
  let value: T | typeof None = None
  let promise: Promise<T> | undefined
  let promiseError: any = undefined
  const listeners: Set<Listener> = new Set()
  let resolve: undefined | ((value: T) => void)

  const setPromised = (newPromise: Promise<T>) => {
    value = None
    promiseError = undefined
    resolve = undefined

    promise = newPromise
      .then((resolvedValue: T) => {
        if (promise === newPromise) {
          promise = undefined
          promiseError = undefined
          value = resolvedValue
          listeners.forEach(_callListener)
        }
        return resolvedValue
      })
      .catch((error: any) => {
        if (promise === newPromise) {
          promise = undefined
          promiseError = error
          listeners.forEach(_callListener)
        }
        throw error
      })
  }

  const store = {
    /**
     * Get the current value of the store.
     * @returns {T} The current value of the store.
     * @throws {Promise<T>} If the value is not set yet, it will throw a promise that will resolve when the value is set.
     */
    get(): T {
      if (promiseError) throw promiseError
      if (promise) throw promise
      if (value === None) {
        promise = new Promise<T>((res) => {
          resolve = res
        })
        throw promise
      }
      return value as T
    },

    get value(): DeepReadonly<T> {
      return value as DeepReadonly<T>
    },

    get identifier() {
      return identifier
    },

    get promise() {
      return promise
    },

    /**
     * Set the value of the store.
     * @param {T | Promise<T> | ((prev: T) => T | Promise<T>)} newValue
     * The new value to set. If it's a function, it will be called with the previous value.
     * If it's a promise, it will set the store to a pending state until the promise resolves.
     */
    set(newValue: T | Promise<T> | ((prev: T) => T | Promise<T>)): void {
      const nextValue =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T | Promise<T>)(value === None ? (undefined as any) : value)
          : newValue

      if (nextValue === None) {
        promise = new Promise<T>((res) => {
          resolve = res
        })
        value = None
        listeners.forEach(_callListener)
      } else if (isPromise(nextValue)) {
        setPromised(nextValue)
      } else if (nextValue !== value || (typeof value === 'object' && value !== null)) {
        if (resolve) {
          const resolver = resolve
          promise = undefined
          resolve = undefined
          promiseError = undefined
          value = nextValue as T
          resolver(nextValue as T)
        } else {
          promise = undefined
          promiseError = undefined
          value = nextValue as T
        }
        listeners.forEach(_callListener)
      }
    },

    _subscribe(listener: Listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    }
  }

  if (isPromise(initialValue)) {
    setPromised(initialValue)
  } else {
    value = initialValue
  }

  return store
}

export const None = Symbol('None') as any

export type SimpleStore<T> = ReturnType<typeof createSimpleStore<T>>

// use seems to be unavailable in the server environment
function _use(promise) {
  if (promise.status === 'fulfilled') {
    return promise.value
  } else if (promise.status === 'rejected') {
    throw promise.reason
  } else if (promise.status === 'pending') {
    throw promise
  } else {
    promise.status = 'pending'
    promise.then(
      (result) => {
        promise.status = 'fulfilled'
        promise.value = result
      },
      (reason) => {
        promise.status = 'rejected'
        promise.reason = reason
      }
    )
    throw promise
  }
}

/**
 * Hook to use a SimpleStore in a React component.
 * Suspends the context until the store has a value.
 * @param store
 * @returns
 */
export function useSimpleStore<T>(
  store: SimpleStore<T>
): [T, (value: T | Promise<T> | ((prev: T) => T | Promise<T>)) => void] {
  const [, forceRerender] = useState({})

  useEffect(() => store._subscribe(() => forceRerender({})), [store])

  if (store.promise) {
    ;(React.use ?? _use)(store.promise)
  }

  return useMemo(() => [store.get(), store.set], [store.get(), store.set])
}

/**
 * Hook to trigger a rerender when a SimpleStore changes.
 * @param store
 * @returns
 */
export function hookSimpleStore<T>(store: SimpleStore<T>): void {
  const [, forceRerender] = useState({})
  useEffect(() => store._subscribe(() => forceRerender({})), [store])
}
