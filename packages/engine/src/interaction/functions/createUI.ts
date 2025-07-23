import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { XRUIComponent } from '@ir-engine/spatial/src/xrui/components/XRUIComponent'
import { WebLayer3D } from '@ir-engine/xrui'

import { MeshBasicMaterial } from 'three'
import { createModalView } from '../ui/InteractiveModalView'

/**
 * Creates and returns an xrUI on the specified entity
 * (this replaces createInteractUI and createNonInteractUI (by adding a bool isInteractable optional param)
 * @param entity  entity to add the xrUI to
 * @param uiMessage  text to display on the UI
 * @param isInteractable  (optional, default = true) sets whether the UI is interactable or not
 * @param borderRadiusPx (optional, default = 10) sets the border radius of the UI in px
 * @param bgPaddingPx (optional, default = 30) sets the padding of the UI background in px
 * @param contentVerticalPadPx (optional, default = 10) sets the padding of the UI content in px
 * @param contentHorizontalPadPx (optional, default = 0) sets the padding of the UI content in px
 */
export function createUI(
  entity: Entity,
  uiMessage: string,
  isInteractable = true,
  borderRadiusPx: number = 10,
  bgPaddingPx: number = 30,
  contentVerticalPadPx: number = 10,
  contentHorizontalPadPx: number = 10
) {
  const ui = createModalView(
    entity,
    uiMessage,
    isInteractable,
    borderRadiusPx,
    bgPaddingPx,
    contentVerticalPadPx,
    contentHorizontalPadPx
  )

  const nameComponent = getComponent(entity, NameComponent)
  setComponent(ui.entity, NameComponent, 'interact-ui-' + uiMessage + '-' + nameComponent)

  const xrui = getComponent(ui.entity, XRUIComponent)
  xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as MeshBasicMaterial
    mat.transparent = true
  })
  const transform = getComponent(ui.entity, TransformComponent)
  transform.scale.setScalar(1)

  return ui
}
