import { useCallback, useEffect, useState } from 'react'

import { defineSystem, PresentationSystemGroup, SystemUUID } from '@ir-engine/ecs'
import {
  GraphJSON,
  GraphNodes,
  ILifecycleEventEmitter,
  IRegistry,
  readGraphFromJSON,
  VisualScriptEngine
} from '@ir-engine/visual-script'

/** Runs the visual script by building the execution
 * engine and triggering start on the lifecycle event emitter.
 */
let systemCounter = 0
let system: SystemUUID | undefined = undefined

export const getOnAsyncExecuteSystemUUID = () => ('visual-script-asyncExecute' + systemCounter) as SystemUUID
export const useVisualScriptRunner = ({
  visualScriptJson,
  autoRun = false,
  registry
}: {
  visualScriptJson: GraphJSON | null
  autoRun?: boolean
  registry: IRegistry
}) => {
  const [engine, setEngine] = useState<VisualScriptEngine>()
  const [run, setRun] = useState(autoRun)

  const play = useCallback(() => {
    setRun(true)
  }, [])

  const pause = useCallback(() => {
    setRun(false)
  }, [])

  const togglePlay = useCallback(() => {
    setRun((existing) => !existing)
  }, [])

  useEffect(() => {
    if (!visualScriptJson || !registry.values || !run || !registry.dependencies) return
    let visualScriptNodes: GraphNodes
    try {
      visualScriptNodes = readGraphFromJSON({
        graphJson: visualScriptJson,
        registry
      }).nodes
    } catch (e) {
      console.error(e)
      return
    }
    const engine = new VisualScriptEngine(visualScriptNodes)

    setEngine(engine)

    return () => {
      engine.dispose()
      setEngine(undefined)
    }
  }, [visualScriptJson, registry.values, run, registry.nodes, registry.dependencies])

  useEffect(() => {
    if (!engine || !run) return
    const eventEmitter = registry.dependencies?.ILifecycleEventEmitter as ILifecycleEventEmitter
    engine.executeAllSync()

    if (eventEmitter.startEvent.listenerCount === 0) {
      console.warn('No onStart Node found in graph.  Graph will not run.')
      return
    }
    eventEmitter.startEvent.emit()
    if (engine.asyncNodes.length) {
      if (system === undefined) {
        systemCounter++
        const systemUUID = defineSystem({
          uuid: getOnAsyncExecuteSystemUUID(),
          execute: () => {
            if (!engine || !run) return
            engine.executeAllAsync(500)
          },
          insert: { after: PresentationSystemGroup }
        })
        system = systemUUID
      }
    }
    return () => {
      if (system === undefined) return
      system = undefined // setting variable to undefined will destroy the system
    }
    // start up
  }, [engine, registry.dependencies?.ILifecycleEventEmitter, run])

  return {
    engine,
    playing: run,
    play,
    togglePlay,
    pause
  }
}
