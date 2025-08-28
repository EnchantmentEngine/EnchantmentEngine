import { act, renderHook } from '@testing-library/react'
import assert from 'assert'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { UserName, userPath } from '@ir-engine/common/src/schema.type.module'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import { EventDispatcher, hookstate } from '@ir-engine/hyperflux'

import { API } from '@ir-engine/common'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { useFind, useGet, useMutation } from './FeathersHooks'

let eventDispatcher: EventDispatcher

describe('FeathersHooks', () => {
  beforeEach(() => {
    createEngine()
    const db = [
      { id: '1', name: 'John' as UserName },
      { id: '2', name: 'Jane' as UserName }
    ]
    eventDispatcher = new EventDispatcher()
    ;(API.instance as any) = {
      service: () => {
        return {
          find: () => {
            return new Promise((resolve) => {
              resolve(
                JSON.parse(
                  JSON.stringify({
                    data: db,
                    limit: 10,
                    skip: 0,
                    total: db.length
                  })
                )
              )
            })
          },
          get: (id) => {
            return new Promise((resolve) => {
              const data = db.find((item) => item.id === id)
              console.log('get', id, data)
              resolve(data ? JSON.parse(JSON.stringify(data)) : null)
            })
          },
          create: (data) => {
            return new Promise((resolve) => {
              const newEntry = {
                id: `${db.length + 1}`,
                name: data.name
              }
              db.push(newEntry)
              resolve({ ...newEntry })
              eventDispatcher.dispatchEvent({
                type: 'created',
                ...newEntry
              })
            })
          },
          update: (id, data) => {
            return new Promise((resolve) => {
              db.find((item) => item.id === id)!.name = data.name
              resolve({
                id,
                name: data.name
              })
              eventDispatcher.dispatchEvent({
                type: 'updated',
                id,
                name: data.name
              })
            })
          },
          patch: (id, data) => {
            return new Promise((resolve) => {
              db.find((item) => item.id === id)!.name = data.name
              resolve(
                JSON.parse(
                  JSON.stringify({
                    id,
                    name: data.name
                  })
                )
              )
              eventDispatcher.dispatchEvent({
                type: 'patched',
                id,
                name: data.name
              })
            })
          },
          remove: (id) => {
            return new Promise((resolve) => {
              const item = db.find((item) => item.id === id)
              db.splice(
                db.findIndex((item) => item.id === id),
                1
              )
              resolve(
                JSON.parse(
                  JSON.stringify({
                    id
                  })
                )
              )
              eventDispatcher.dispatchEvent({
                type: 'removed',
                ...item
              })
            })
          },
          on: (serviceName, cb) => {
            eventDispatcher.addEventListener(serviceName, cb)
          },
          off: (serviceName, cb) => {
            eventDispatcher.removeEventListener(serviceName, cb)
          }
        }
      }
    }
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('useFind', () => {
    it('should populate data', async () => {
      const { result, rerender } = renderHook(() => {
        return useFind(userPath)
      })
      await act(() => {
        rerender()
      })
      const { data } = result.current
      assert.strictEqual(data.length, 2)
      assert.strictEqual(data[0].name, 'John')
      assert.strictEqual(data[1].name, 'Jane')
    })

    it('should return the data with params', async () => {
      const { result, rerender } = renderHook(() => {
        return useFind(userPath, { query: { name: 'John' } })
      })
      await act(() => {
        rerender()
      })
      const { data } = result.current
      assert.strictEqual(data?.[0]?.name, 'John')
    })
  })

  describe('useGet', () => {
    it('should get entry', async () => {
      const { result, rerender } = renderHook(() => {
        return useGet(userPath, '1')
      })
      await act(() => {
        rerender()
      })
      const { data } = result.current
      assert.strictEqual(data?.name, 'John')
    })
  })

  describe('useMutation', () => {
    it('should create data', async () => {
      const { result, rerender } = renderHook(() => {
        return useMutation(userPath)
      })
      await act(() => {
        rerender()
      })
      await act(() => {
        result.current.create({ name: 'Jack' as UserName, isGuest: true })
      })
      const findHook = renderHook(() => {
        return useFind(userPath)
      })
      await act(() => {
        findHook.rerender()
      })
      const { data } = findHook.result.current
      assert.strictEqual(data.length, 3)
      assert.strictEqual(data[2]?.name, 'Jack')
    })

    it('should update data', async () => {
      const { result, rerender } = renderHook(() => {
        return useMutation(userPath)
      })
      await act(() => {
        rerender()
      })
      await act(() => {
        result.current.update('1', { name: 'Jack' } as any)
      })
      const findHook = renderHook(() => {
        return useFind(userPath)
      })
      await act(() => {
        findHook.rerender()
      })
      const { data } = findHook.result.current
      assert.strictEqual(data[0]?.name, 'Jack')
    })

    it('should patch data', async () => {
      const { result, rerender } = renderHook(() => {
        return useMutation(userPath)
      })
      await act(() => {
        rerender()
      })
      await act(() => {
        result.current.patch('1', { name: 'Jack' as UserName })
      })
      const findHook = renderHook(() => {
        return useFind(userPath)
      })
      await act(() => {
        findHook.rerender()
      })
      const { data } = findHook.result.current
      assert.strictEqual(data[0]?.name, 'Jack')
    })

    it('should remove data', async () => {
      const { result, rerender } = renderHook(() => {
        return useMutation(userPath)
      })
      await act(() => {
        rerender()
      })
      await act(() => {
        result.current.remove('1')
      })
      const findHook = renderHook(() => {
        return useFind(userPath)
      })
      await act(() => {
        findHook.rerender()
      })
      const { data } = findHook.result.current
      assert.strictEqual(data.length, 1)
    })
  })

  describe('can use listeners', () => {
    describe('on created', () => {
      it('should populate find query', async () => {
        const result = hookstate({} as any)
        const { rerender } = renderHook(() => {
          const data = useFind(userPath)
          useEffect(() => {
            result.set(data)
          }, [data.data.length])
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          API.instance.service(userPath).create({ name: 'Jack' as UserName, isGuest: true })
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.value.data.length, 3)
        assert.strictEqual(result.value.data[2]?.name, 'Jack')
      })

      it('should populate get query', async () => {
        const result = hookstate({} as any)
        const { rerender } = renderHook(() => {
          const data = useGet(userPath, '3')
          useEffect(() => {
            result.set(data)
          }, [data.data?.name])
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          API.instance.service(userPath).create({ name: 'Jack' as UserName, isGuest: true })
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.value.data?.name, 'Jack')
      })
    })

    describe('on updated', () => {
      it('should populate data', async () => {
        const { result, rerender } = renderHook(() => {
          return useFind(userPath)
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          API.instance.service(userPath).update('1', { name: 'Jack' as UserName })
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.current.data[0]?.name, 'Jack')
      })

      it('should populate get query', async () => {
        const result = hookstate({} as any)
        const { rerender } = renderHook(() => {
          const data = useGet(userPath, '1')
          useEffect(() => {
            result.set(data)
          }, [data.data?.name])
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          API.instance.service(userPath).update('1', { name: 'Jack' as UserName })
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.value.data?.name, 'Jack')
      })
    })

    describe('on patched', () => {
      it('should populate data', async () => {
        const { result, rerender } = renderHook(() => {
          return useFind(userPath)
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          API.instance.service(userPath).patch('1', { name: 'Jack' as UserName })
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.current.data[0]?.name, 'Jack')
      })

      it('should populate get query', async () => {
        const result = hookstate({} as any)
        const { rerender } = renderHook(() => {
          const data = useGet(userPath, '1')
          useEffect(() => {
            result.set(data)
          }, [data.data?.name])
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          API.instance.service(userPath).patch('1', { name: 'Jack' as UserName })
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.value.data?.name, 'Jack')
      })
    })

    describe('on removed', () => {
      it('should populate data', async () => {
        const { result, rerender } = renderHook(() => {
          return useFind(userPath)
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          API.instance.service(userPath).remove('1')
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.current.data.length, 1)
      })

      it('should populate get query', async () => {
        const result = hookstate({} as any)
        const { rerender } = renderHook(() => {
          const data = useGet(userPath, '1')
          useEffect(() => {
            result.set(data)
          }, [data.data?.name])
        })
        await act(() => {
          rerender()
        })
        await act(() => {
          API.instance.service(userPath).remove('1')
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(result.value.data, null)
      })
    })

    describe('should not create multiple listeners', () => {
      it('should not create multiple listeners', async () => {
        const { rerender } = renderHook(() => {
          const data = useFind(userPath)
          const data2 = useFind(userPath)
        })
        await act(() => {
          rerender()
        })
        assert.strictEqual(eventDispatcher._listeners.created.length, 1)
        assert.strictEqual(eventDispatcher._listeners.updated.length, 1)
        assert.strictEqual(eventDispatcher._listeners.patched.length, 1)
        assert.strictEqual(eventDispatcher._listeners.removed.length, 1)
      })
    })
  })
})
