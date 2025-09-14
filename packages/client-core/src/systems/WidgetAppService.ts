import {
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  matches,
  none,
  Validator
} from '@ir-engine/hyperflux'

import { Widget } from './Widgets'

export class WidgetAppActions {
  static showWidgetMenu = defineAction({
    type: 'xre.xrui.WidgetAppActions.SHOW_WIDGET_MENU' as const,
    shown: matches.boolean,
    handedness: matches.string.optional() as Validator<unknown, 'left' | 'right' | undefined>
  })

  static registerWidget = defineAction({
    type: 'xre.xrui.WidgetAppActions.REGISTER_WIDGET' as const,
    id: matches.string
  })

  static unregisterWidget = defineAction({
    type: 'xre.xrui.WidgetAppActions.UNREGISTER_WIDGET' as const,
    id: matches.string
  })

  static enableWidget = defineAction({
    type: 'xre.xrui.WidgetAppActions.ENABLE_WIDGET' as const,
    id: matches.string,
    enabled: matches.boolean
  })

  static showWidget = defineAction({
    type: 'xre.xrui.WidgetAppActions.SHOW_WIDGET' as const,
    id: matches.string,
    shown: matches.boolean,
    openWidgetMenu: matches.boolean.optional(),
    handedness: matches.string.optional() as Validator<unknown, 'left' | 'right' | undefined>
  })
}

type WidgetMutableState = Record<string, { enabled: boolean; visible: boolean }>

/** @todo refactor this and WidgetAppState into WidgetState */
export const RegisteredWidgets = new Map<string, Widget>()

/** @todo make this networkable by making widget store per user */
export const WidgetAppState = defineState({
  name: 'WidgetAppState',
  initial: () => ({
    widgetsMenuOpen: false,
    widgets: {} as WidgetMutableState,
    handedness: 'left' as 'left' | 'right'
  }),
  receptors: {
    showWidgetMenu: WidgetAppActions.showWidgetMenu.receive((action) => {
      const s = getMutableState(WidgetAppState)
      s.widgetsMenuOpen.set(action.shown)
      if (action.handedness) s.handedness.set(action.handedness)
    }),
    registerWidget: WidgetAppActions.registerWidget.receive((action) => {
      const s = getMutableState(WidgetAppState)
      s.widgets.merge({
        [action.id]: {
          enabled: true,
          visible: false
        }
      })
    }),
    unregisterWidget: WidgetAppActions.unregisterWidget.receive((action) => {
      const s = getMutableState(WidgetAppState)
      if (s.widgetsMenuOpen.value) {
        s.widgetsMenuOpen.set(false)
      }
      s.widgets[action.id].set(none)
    }),
    enableWidget: WidgetAppActions.enableWidget.receive((action) => {
      const s = getMutableState(WidgetAppState)
      s.widgets[action.id].merge({
        enabled: action.enabled
      })
    }),
    showWidget: WidgetAppActions.showWidget.receive((action) => {
      const s = getMutableState(WidgetAppState)
      // if opening or closing a widget, close or open the main menu
      if (action.handedness) s.handedness.set(action.handedness)
      if (action.shown) s.widgetsMenuOpen.set(false)
      if (action.openWidgetMenu && !action.shown) s.widgetsMenuOpen.set(true)
      s.widgets[action.id].merge({
        visible: action.shown
      })
    })
  }
})

export const WidgetAppService = {
  closeWidgets: () => {
    const widgetMutableState = getMutableState(WidgetAppState)
    const widgets = Object.entries(widgetMutableState.widgets.value).map(([id, widgetMutableState]) => ({
      id,
      ...widgetMutableState,
      ...RegisteredWidgets.get(id)!
    }))
    for (let widget of widgets) {
      if (widget.visible) {
        dispatchAction(WidgetAppActions.showWidget({ id: widget.id, shown: false }))
      }
    }
  },
  setWidgetVisibility: (widgetName: string, visibility: boolean) => {
    const widgetMutableState = getMutableState(WidgetAppState)
    const widgets = Object.entries(widgetMutableState.widgets.value).map(([id, widgetMutableState]) => ({
      id,
      ...widgetMutableState,
      ...RegisteredWidgets.get(id)!
    }))

    const currentWidget = widgets.find((w) => w.label === widgetName)

    // close currently open widgets until we support multiple widgets being open at once
    for (let widget of widgets) {
      if (currentWidget && widget.id !== currentWidget.id && widget.visible) {
        dispatchAction(WidgetAppActions.showWidget({ id: widget.id, shown: false }))
      }
    }

    currentWidget && dispatchAction(WidgetAppActions.showWidget({ id: currentWidget.id, shown: visibility }))
  }
}
