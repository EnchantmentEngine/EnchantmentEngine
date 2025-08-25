import { LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import * as ECS from '@ir-engine/ecs'
import { SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import { getMutableState, getState, HyperFlux } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import React, { useEffect, useRef, useState } from 'react'
import { Euler, Quaternion, Vector3 } from 'three'

export default function SceneDecorator({ sceneName }: { sceneName?: string }) {
  const [activeScene, setActiveScene] = useState(sceneName)
  const unloadRef = useRef<() => void | null>(null)

  useEffect(() => {
    if (!sceneName) return

    getMutableState(LocationState).currentLocation.location.sceneId.set(1 as any)
    getMutableState(LocationState).currentLocation.location.sceneURL.set(sceneName)
    const viewerEntity = getState(ReferenceSpaceState).viewerEntity
    ECS.setComponent(viewerEntity, TransformComponent, {
      position: new Vector3(0, 2, 0),
      rotation: new Quaternion().setFromEuler(new Euler((Math.PI / 180) * 10, Math.PI, 0))
    })

    // Store the unload function in a ref
    const unload = SceneState.loadScene(sceneName as any, 1 as any, viewerEntity)
    // @ts-ignore
    unloadRef.current = unload
    setActiveScene(sceneName)

    return () => {
      if (!HyperFlux.store) return
      getMutableState(LocationState).currentLocation.location.sceneId.set('')
      getMutableState(LocationState).currentLocation.location.sceneURL.set('')
      unload()
    }
  }, [activeScene])

  useEffect(() => {
    if (sceneName !== activeScene) {
      unloadRef.current?.()
      setActiveScene(sceneName)
    }
  }, [sceneName])
  return <div key={sceneName} />
}
