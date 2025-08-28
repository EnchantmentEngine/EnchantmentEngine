import { WidgetAppServiceReceptorSystem } from '../systems/WidgetAppService'

import { OverlaySystem } from '@ir-engine/client-core/src/systems/OverlaySystem'
import { AvatarSpawnSystem } from '../networking/AvatarSpawnSystem'
import { AudioDuckingSystem } from '../systems/AudioDuckingSystem'
import { AvatarUISystem } from '../systems/AvatarUISystem'
import { LinkErrorSystem } from '../systems/LinkErrorSystem'
import { LoadingUISystem } from '../systems/LoadingUISystem'
import { MediaControlSystem } from '../systems/MediaControlSystem'
import { PositionalAudioSystem } from '../systems/PositionalAudioSystem'
import { PoiUiSystem } from '../systems/ui/PoiUI'
import { WarningUISystem } from '../systems/WarningUISystem'
import { WidgetUISystem } from '../systems/WidgetUISystem'
import { UserUISystem } from '../user/UserUISystem'
import { LinkRedirectSystem } from './LinkRedirectSystem'
import { PortalRedirectSystem } from './PortalRedirectSystem'

import './ClientNetworkModule'
import './ScriptNamespaceModule'

export {
  AudioDuckingSystem,
  AvatarSpawnSystem,
  AvatarUISystem,
  LinkErrorSystem,
  LinkRedirectSystem,
  LoadingUISystem,
  MediaControlSystem,
  OverlaySystem,
  PoiUiSystem,
  PortalRedirectSystem,
  PositionalAudioSystem,
  UserUISystem,
  WarningUISystem,
  WidgetAppServiceReceptorSystem,
  WidgetUISystem
}
