import { removeComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { dispatchAction } from '@ir-engine/hyperflux'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { createXRUI } from '@ir-engine/spatial/src/xrui/createXRUI'
import { DotsVerticalLg } from '@ir-engine/ui/src/icons'
import { WidgetAppActions } from './WidgetAppService'
import { Widget, Widgets } from './Widgets'

export function createHeightAdjustmentWidget() {
  const ui = createXRUI(() => null)
  removeComponent(ui.entity, VisibleComponent)

  const widget: Widget = {
    ui,
    label: 'Height Adjustment',
    icon: DotsVerticalLg,
    onOpen: () => {
      dispatchAction(WidgetAppActions.showWidget({ id, shown: false }))
      XRState.setTrackingSpace()
    }
  }

  const id = Widgets.registerWidget(ui.entity, widget)
  /** @todo better API to disable */
  dispatchAction(WidgetAppActions.enableWidget({ id, enabled: false }))
}
