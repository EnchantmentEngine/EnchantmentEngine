import { LayoutData } from 'rc-dock'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { UUIDComponent } from '@ir-engine/ecs'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { AssetModifiedState } from '@ir-engine/engine/src/gltf/GLTFState'
import { LinkState } from '@ir-engine/engine/src/scene/components/LinkComponent'

import { defineState, getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'

export const UIMode = {
  BASIC: 'BASIC',
  ADVANCED: 'ADVANCED'
} as const

export type UIModeType = (typeof UIMode)[keyof typeof UIMode]

export type ActiveLowerPanel = 'properties' | 'inspector'

export const EditorState = defineState({
  name: 'EditorState',
  initial: () => ({
    projectName: null as string | null,
    sceneName: null as string | null,
    /** the url of the current scene file */
    scenePath: null as string | null,
    /** just used to store the id of the current scene asset */
    sceneAssetID: null as string | null,
    panelLayout: {} as LayoutData,
    rootEntity: UndefinedEntity,
    uiEnabled: true,
    uiMode: UIMode.ADVANCED,
    canvasRef: null as React.RefObject<HTMLElement> | null,
    activeLowerPanel: 'properties' as ActiveLowerPanel
  }),
  setActiveLowerPanel: (panel: ActiveLowerPanel) => {
    getMutableState(EditorState).activeLowerPanel.set(panel)
  },
  useIsModified: () => {
    const rootEntity = useHookstate(getMutableState(EditorState).rootEntity).value
    const modifiedState = useMutableState(AssetModifiedState)
    if (!rootEntity) return false
    return !!modifiedState[GLTFComponent.getSourceID(rootEntity)].value
  },
  isModified: () => {
    const rootEntity = getState(EditorState).rootEntity
    if (!rootEntity) return false
    return !!getState(AssetModifiedState)[GLTFComponent.getSourceID(rootEntity)]
  },
  markModifiedScene: (entity: Entity) => {
    const sourceID = GLTFComponent.getSourceID(entity)
    if (!sourceID) return

    const modifiedState = getMutableState(AssetModifiedState)
    modifiedState[sourceID].set(true)
    const activeScene = getState(EditorState).rootEntity
    //also mark the active scene as modified due to scene deltas being added
    const rootSourceID = GLTFComponent.getSourceID(activeScene)
    if (rootSourceID !== sourceID) {
      modifiedState[rootSourceID].set(true)
    }
  },
  isInActiveScene: (entity: Entity) => {
    const rootEntity = getState(EditorState).rootEntity
    const sourceEntity = UUIDComponent.getSourceEntity(entity)
    return sourceEntity === rootEntity
  },
  reactor: () => {
    const linkState = useMutableState(LinkState)

    useEffect(() => {
      if (!linkState.location.value) return

      NotificationService.dispatchNotify('Scene navigation is disabled in the studio', { variant: 'warning' })
      linkState.location.set(undefined)
    }, [linkState.location])

    return null
  }
})
