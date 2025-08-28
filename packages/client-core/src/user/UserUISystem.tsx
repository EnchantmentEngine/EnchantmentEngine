import React, { useEffect } from 'react'

import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState, NetworkState, useHookstate } from '@ir-engine/hyperflux'

import { EngineState, QueryReactor, setComponent, useEntityContext, useOptionalComponent } from '@ir-engine/ecs'
import { OverlayComponent } from '@ir-engine/engine/src/scene/components/OverlayComponent'
import { ModalState } from '../common/services/ModalState'
import { InviteService } from '../social/services/InviteService'
import { LoadingUISystemState } from '../systems/LoadingUISystem'
import { OverlayComponentState } from '../systems/OverlaySystem'
import { ViewerMenuState } from '../util/ViewerMenuState'

const OverlayReactor = () => {
  const entity = useEntityContext()
  const overlayComponent = useOptionalComponent(entity, OverlayComponent)
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

  const onClose = () => {
    setComponent(entity, OverlayComponent, { isOpen: false })
    ModalState.closeModal()
    setIsPopoverOpen(false)
  }

  useEffect(() => {
    if (overlayComponent?.isOpen && !isPopoverOpen) {
      const popoverType = overlayComponent?.type
      if (!popoverType) return
      const Component = getState(OverlayComponentState)[popoverType]
      ModalState.openModal(<Component component={overlayComponent} onClose={onClose} />, () => {
        onClose()
      })
      setIsPopoverOpen(true)
    }
  }, [overlayComponent?.isOpen])

  return null
}

const UserSystemReactor = () => {
  InviteService.useAPIListeners()

  const worldHostId = useHookstate(getMutableState(NetworkState).hostIds.world).value

  useEffect(() => {
    const viewerUserMenuState = getMutableState(ViewerMenuState).userMenus
    viewerUserMenuState.merge({
      share: true
    })
    return () =>
      viewerUserMenuState.merge({
        share: false
      })
  }, [worldHostId])

  return <QueryReactor Components={[OverlayComponent]} ChildEntityReactor={OverlayReactor} />
}

export const UserUISystem = defineSystem({
  uuid: 'ee.client.UserUISystem2',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const userID = useHookstate(getMutableState(EngineState)).userID.value
    const ready = useHookstate(getMutableState(LoadingUISystemState)).ready

    if (!userID || !ready.value) return null

    return <UserSystemReactor />
  }
})
