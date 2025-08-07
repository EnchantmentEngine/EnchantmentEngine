import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSimpleStore, None, SimpleStore } from './SimpleStore'

describe('SimpleStore Core Functionality', () => {
  let store: SimpleStore<number>

  beforeEach(() => {
    store = createSimpleStore(42)
  })

  describe('Basic Operations', () => {
    it('should create a store with initial value', () => {
      expect(store.get()).toBe(42)
    })

    it('should set and get values', () => {
      store.set(100)
      expect(store.get()).toBe(100)
    })

    it('should provide readonly access to value property', () => {
      expect(store.value).toBe(42)
    })

    it('should have optional identifier', () => {
      const namedStore = createSimpleStore(1, 'test-store')
      expect(namedStore.identifier).toBe('test-store')

      expect(store.identifier).toBeUndefined()
    })

    it('should update value using function', () => {
      store.set((prev) => prev * 2)
      expect(store.get()).toBe(84)
    })

    it('should handle object updates correctly', () => {
      const objectStore = createSimpleStore({ count: 0, name: 'test' })
      objectStore.set({ count: 1, name: 'updated' })
      expect(objectStore.get()).toEqual({ count: 1, name: 'updated' })
    })
  })

  describe('None Symbol Handling', () => {
    it('should handle None as initial value', () => {
      const noneStore = createSimpleStore<string>(None)

      let thrownValue: any
      try {
        noneStore.get()
      } catch (thrown) {
        thrownValue = thrown
      }

      expect(thrownValue).toBeInstanceOf(Promise)
      expect(noneStore.promise).toBeDefined()
    })

    it('should set value to None and create promise', () => {
      let thrownValue: any

      store.set(None)

      try {
        store.get()
      } catch (thrown) {
        thrownValue = thrown
      }

      expect(thrownValue).toBeInstanceOf(Promise)
      expect(store.promise).toBeDefined()
    })

    it('should resolve None promise when value is set', async () => {
      store.set(None)
      const promise = store.promise!

      setTimeout(() => store.set(999), 10)

      await expect(promise).resolves.toBe(999)
      expect(store.get()).toBe(999)
    })
  })

  describe('Promise Handling', () => {
    it('should handle promise as initial value', async () => {
      const promiseStore = createSimpleStore(Promise.resolve(123))

      let thrownValue: any
      try {
        promiseStore.get()
      } catch (thrown) {
        thrownValue = thrown
      }

      expect(thrownValue).toBeInstanceOf(Promise)
      expect(promiseStore.promise).toBeDefined()

      await promiseStore.promise
      expect(promiseStore.get()).toBe(123)
    })

    it('should handle rejected promises', async () => {
      const error = new Error('Test error')
      const promiseStore = createSimpleStore(Promise.reject(error))

      let thrownValue: any
      try {
        promiseStore.get()
      } catch (thrown) {
        thrownValue = thrown
      }

      expect(thrownValue).toBeInstanceOf(Promise)

      try {
        await promiseStore.promise
      } catch (e) {
        // Expected to reject
      }

      // After promise rejection, get() should throw the error
      try {
        promiseStore.get()
      } catch (thrown) {
        expect(thrown).toBe(error)
      }
    })

    it('should handle promise from setter', async () => {
      let thrownValue: any

      store.set(Promise.resolve(777))

      try {
        store.get()
      } catch (thrown) {
        thrownValue = thrown
      }

      expect(thrownValue).toBeInstanceOf(Promise)
      expect(store.promise).toBeDefined()

      await store.promise
      expect(store.get()).toBe(777)
    })

    it('should handle function returning promise', async () => {
      store.set(() => Promise.resolve(888))

      let thrownValue: any
      try {
        store.get()
      } catch (thrown) {
        thrownValue = thrown
      }

      expect(thrownValue).toBeInstanceOf(Promise)
      await store.promise
      expect(store.get()).toBe(888)
    })

    it('should handle multiple promises correctly', async () => {
      // Set first promise
      store.set(Promise.resolve(111))
      const firstPromise = store.promise

      // Set second promise before first resolves
      store.set(Promise.resolve(222))
      const secondPromise = store.promise

      expect(firstPromise).not.toBe(secondPromise)

      await secondPromise
      expect(store.get()).toBe(222)
    })
  })

  describe('Subscriptions and Listeners', () => {
    it('should notify listeners on value change', () => {
      const listener = vi.fn()
      const unsubscribe = store.subscribe(listener)

      store.set(999)
      expect(listener).toHaveBeenCalledTimes(1)

      store.set(1000)
      expect(listener).toHaveBeenCalledTimes(2)

      unsubscribe()
    })

    it('should unsubscribe listeners correctly', () => {
      const listener = vi.fn()
      const unsubscribe = store.subscribe(listener)

      store.set(999)
      expect(listener).toHaveBeenCalledTimes(1)

      unsubscribe()
      store.set(1000)
      expect(listener).toHaveBeenCalledTimes(1) // Should not be called again
    })

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      store.subscribe(listener1)
      store.subscribe(listener2)

      store.set(555)

      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })

    it('should notify listeners when promise resolves', async () => {
      const listener = vi.fn()
      store.subscribe(listener)

      // Setting a promise should not call listeners immediately
      store.set(Promise.resolve(333))
      expect(listener).toHaveBeenCalledTimes(0)

      // But when promise resolves, listeners should be called
      await store.promise
      expect(listener).toHaveBeenCalledTimes(1)
      expect(store.get()).toBe(333)
    })

    it('should notify listeners when setting None', () => {
      const listener = vi.fn()
      store.subscribe(listener)

      store.set(None)
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const nullStore = createSimpleStore<string | null>(null)
      expect(nullStore.get()).toBe(null)

      nullStore.set('not null')
      expect(nullStore.get()).toBe('not null')

      nullStore.set(null)
      expect(nullStore.get()).toBe(null)
    })

    it('should handle undefined values', () => {
      const undefinedStore = createSimpleStore<string | undefined>(undefined)
      expect(undefinedStore.get()).toBe(undefined)
    })

    it('should handle array values', () => {
      const arrayStore = createSimpleStore([1, 2, 3])
      expect(arrayStore.get()).toEqual([1, 2, 3])

      arrayStore.set([4, 5, 6])
      expect(arrayStore.get()).toEqual([4, 5, 6])
    })

    it('should handle nested object updates', () => {
      const nestedStore = createSimpleStore({
        user: { name: 'John', age: 30 },
        settings: { theme: 'dark' }
      })

      const newValue = {
        user: { name: 'Jane', age: 25 },
        settings: { theme: 'light' }
      }

      nestedStore.set(newValue)
      expect(nestedStore.get()).toEqual(newValue)
    })

    it('should trigger listeners for object changes even if reference is the same', () => {
      const obj = { count: 0 }
      const objStore = createSimpleStore(obj)
      const listener = vi.fn()

      objStore.subscribe(listener)

      // Same reference but should still trigger listener for objects
      objStore.set(obj)
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should not trigger listeners for primitive values that are the same', () => {
      const listener = vi.fn()
      store.subscribe(listener)

      store.set(42) // Same as initial value
      expect(listener).not.toHaveBeenCalled()

      store.set(43) // Different value
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('Type Safety', () => {
    it('should maintain type safety with generic types', () => {
      interface User {
        id: number
        name: string
      }

      const userStore = createSimpleStore<User>({ id: 1, name: 'John' })
      const user = userStore.get()

      expect(user.id).toBe(1)
      expect(user.name).toBe('John')

      userStore.set({ id: 2, name: 'Jane' })
      expect(userStore.get().name).toBe('Jane')
    })
  })
})
