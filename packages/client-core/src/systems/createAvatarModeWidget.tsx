import { useEffect } from 'react'

import { getComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createXRUI } from '@ir-engine/engine/src/xrui/createXRUI'
import { dispatchAction, getMutableState, getState, startReactor, useHookstate } from '@ir-engine/hyperflux'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { WidgetAppActions } from './WidgetAppService'

import {
  EngineState,
  EntityNetworkState,
  EntityTreeComponent,
  EntityUUID,
  UUIDComponent,
  iterateEntityNode
} from '@ir-engine/ecs'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { translateAndRotateAvatar, updateLocalAvatarPosition } from '@ir-engine/engine/src/avatar/functions/moveAvatar'
import { respawnAvatar } from '@ir-engine/engine/src/avatar/functions/respawnAvatar'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { User01Lg } from '@ir-engine/ui/src/icons'
import { Quaternion, Vector3 } from 'three'
import { Widget, Widgets } from './Widgets'

export function createAvatarModeWidget() {
  const ui = createXRUI(() => null)
  removeComponent(ui.entity, VisibleComponent)

  const widget: Widget = {
    ui,
    label: 'Avatar Mode',
    icon: User01Lg,
    onOpen: () => {
      const avatarEntity = AvatarComponent.getSelfAvatarEntity()
      const currentParent = getComponent(avatarEntity, EntityTreeComponent).parentEntity
      if (currentParent === getState(ReferenceSpaceState).localFloorEntity) {
        getMutableState(XRState).avatarCameraMode.set('auto')
        const uuid = getState(EngineState).userID as any as EntityUUID
        const parentUUID = getState(EntityNetworkState)[uuid].parentUUID
        const parentEntity = UUIDComponent.getEntityByUUID(parentUUID)
        setComponent(avatarEntity, EntityTreeComponent, { parentEntity })
        respawnAvatar(avatarEntity)
        iterateEntityNode(avatarEntity, TransformComponent.computeTransformMatrix)
      } else {
        getMutableState(XRState).avatarCameraMode.set('attached')
        setComponent(avatarEntity, EntityTreeComponent, {
          parentEntity: getState(ReferenceSpaceState).localFloorEntity
        })
        getComponent(avatarEntity, RigidBodyComponent).targetKinematicPosition.set(0, 0, 0) // todo instead fo 0,0,0 make it camera relative to floor entity on the floor (y = 0)
        updateLocalAvatarPosition(avatarEntity)
        translateAndRotateAvatar(avatarEntity, new Vector3(), new Quaternion())
        console.log(
          getComponent(getState(ReferenceSpaceState).localFloorEntity, TransformComponent).position.x,
          getComponent(getState(ReferenceSpaceState).localFloorEntity, TransformComponent).position.y,
          getComponent(getState(ReferenceSpaceState).localFloorEntity, TransformComponent).position.z
        )
        iterateEntityNode(avatarEntity, TransformComponent.computeTransformMatrix)
      }
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: false }))
    }
  }

  /** for testing */
  // globalThis.toggle = widget.onOpen

  const id = Widgets.registerWidget(ui.entity, widget)

  const reactor = startReactor(() => {
    const xrState = useHookstate(getMutableState(XRState))
    const shouldViewerFollowController = XRState.useShouldViewerFollowController()
    const widgetEnabled =
      xrState.sessionMode.value === 'immersive-ar' &&
      xrState.scenePlacementMode.value === 'placed' &&
      !shouldViewerFollowController

    useEffect(() => {
      dispatchAction(WidgetAppActions.enableWidget({ id, enabled: widgetEnabled }))
    }, [widgetEnabled])

    return null
  }, `createAvatarModeWidget`)
}
