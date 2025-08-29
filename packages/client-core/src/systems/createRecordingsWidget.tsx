import { removeComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { createXRUI } from '@ir-engine/spatial/src/xrui/createXRUI'
import { Widget, Widgets } from './Widgets'

import { VideoRecorderLg } from '@ir-engine/ui/src/icons'
import { RecordingsWidgetUI } from './ui/RecordingsWidgetUI'

export function createRecordingsWidget() {
  const ui = createXRUI(RecordingsWidgetUI)
  removeComponent(ui.entity, VisibleComponent)

  const widget: Widget = {
    ui,
    label: 'Recording',
    icon: VideoRecorderLg
  }

  const id = Widgets.registerWidget(ui.entity, widget)
}
