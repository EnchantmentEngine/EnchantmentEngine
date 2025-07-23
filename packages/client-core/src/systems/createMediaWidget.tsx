import { createXRUI } from '@ir-engine/engine/src/xrui/createXRUI'
import { Widget, Widgets } from './Widgets'

import { Users02Lg } from '@ir-engine/ui/src/icons'
import { VideoWindowsWidget } from '../user/VideoWindows'

export function createMediaWidget() {
  const ui = createXRUI(VideoWindowsWidget)
  // removeComponent(ui.entity, VisibleComponent)

  const widget: Widget = {
    ui,
    label: 'Media',
    icon: Users02Lg,
    onOpen: () => {},
    system: () => {},
    cleanup: async () => {}
  }

  const id = Widgets.registerWidget(ui.entity, widget)
}
