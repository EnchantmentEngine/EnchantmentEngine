import { Entity } from '@ir-engine/ecs/src/Entity'
import { createXRUI } from '@ir-engine/engine/src/xrui/createXRUI'
import { dispatchAction } from '@ir-engine/hyperflux'
import { SVGIconType } from '@ir-engine/ui/src/icons/types'
import { IconType } from 'react-icons'
import { RegisteredWidgets, WidgetAppActions } from './WidgetAppService'

/**
 * The widget interface.
 *
 * @param {XRUI} ui stores a reference to the XRUI container, entity and state
 * @param {string} label is the display label of the widget
 * @param {any} icon is the icon to display on the widget menu
 * @param {Function} system is a system that will run while a widget is enabled and visible
 */

export const WidgetName = {
  PROFILE: 'ProfileMenu',
  SETTINGS: 'SettingsMenu',
  SOCIALS: 'SocialsMenu',
  LOCATION: 'LocationMenu',
  ADMIN_CONTROLS: 'AdminControlsMenu',
  MEDIA_SESSION: 'MediaSessionMenu',
  CHAT: 'Chat',
  EMOTE: 'Emote',
  READY_PLAYER: 'ReadyPlayer',
  SELECT_AVATAR: 'SelectAvatar',
  SHARE_LOCATION: 'ShareLocation',
  UPLOAD_AVATAR: 'UploadAvatar'
}

export type Widget = {
  ui: ReturnType<typeof createXRUI>
  label: string
  icon?: SVGIconType | IconType
  onOpen?: () => void
  onClose?: () => void
  system?: () => void
  cleanup?: () => Promise<void>
}

export const registerWidget = (xruiEntity: Entity, widget: Widget) => {
  const id = `${widget.label}-${xruiEntity}`
  dispatchAction(WidgetAppActions.registerWidget({ id }))
  RegisteredWidgets.set(id, widget)
  return id
}

export const Widgets = {
  registerWidget
}
