import React, { useEffect } from 'react'
import { Material, Mesh } from 'three'

import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'

import { QueryReactor, getComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { MeshComponent } from '../renderer/components/MeshComponent'
import { VisibleComponent } from '../renderer/components/VisibleComponent'
import { XRState } from './XRState'

type ScenePlacementMaterialType = {
  userData: {
    ScenePlacement?: {
      previouslyTransparent: boolean
      previousOpacity: number
    }
  }
}

const addShaderToObject = (obj: Mesh<any, Material & ScenePlacementMaterialType>) => {
  if (obj.material) {
    if (!obj.material.userData) obj.material.userData = {}
    const userData = obj.material.userData
    if (!userData.ScenePlacement) {
      userData.ScenePlacement = {
        previouslyTransparent: obj.material.transparent,
        previousOpacity: obj.material.opacity
      }
    }
    obj.material.transparent = true
    obj.material.opacity = 0.3
    obj.material.needsUpdate = true
  }
}

const removeShaderFromObject = (obj: Mesh<any, Material & ScenePlacementMaterialType>) => {
  if (obj.material) {
    const userData = obj.material.userData
    if (userData?.ScenePlacement) {
      obj.material.transparent = userData.ScenePlacement.previouslyTransparent
      obj.material.opacity = userData.ScenePlacement.previousOpacity
      delete userData.ScenePlacement
    }
  }
}

/**
 * Updates materials with scene object placement opacity shader
 * @param world
 * @returns
 */

function XRScenePlacementReactor() {
  const entity = useEntityContext()
  const meshComponent = useComponent(entity, MeshComponent)

  useEffect(() => {
    const mesh = getComponent(entity, MeshComponent) as Mesh<any, Material & ScenePlacementMaterialType>

    addShaderToObject(mesh)
    return () => {
      removeShaderFromObject(mesh)
    }
  }, [meshComponent])

  return null
}

const reactor = () => {
  const xrState = getMutableState(XRState)
  const scenePlacementMode = useHookstate(xrState.scenePlacementMode).value
  const sessionActive = useHookstate(xrState.sessionActive).value

  if (scenePlacementMode !== 'placing' || !sessionActive) return null

  return <QueryReactor ChildEntityReactor={XRScenePlacementReactor} Components={[VisibleComponent, MeshComponent]} />
}

export const XRScenePlacementShaderSystem = defineSystem({
  uuid: 'ee.engine.XRScenePlacementShaderSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
